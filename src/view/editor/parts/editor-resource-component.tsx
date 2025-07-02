/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import {
	ChipInput,
	ChipInputProps,
	ChipItem,
	Container,
	DropdownItem,
	Theme
} from '@zextras/carbonio-design-system';
import { find, uniqBy } from 'lodash';
import styled from 'styled-components';

import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart,
	selectEditorUid
} from '../../../store/selectors/editor';
import { Resource } from '../../../types/editor';
import { Contact } from '../../../types/soap/soap-actions';

interface SkeletonTileProps {
	$width?: string;
	$height?: string;
	$radius?: string;
}
type ResourceInputOption = DropdownItem & { value?: Resource };

const SkeletonTile = styled.div<SkeletonTileProps>`
	width: ${({ $width }): string => $width ?? '1rem'};
	max-width: ${({ $width }): string => $width ?? '1rem'};
	min-width: ${({ $width }): string => $width ?? '1rem'};
	height: ${({ $height }): string => $height ?? '1rem'};
	max-height: ${({ $height }): string => $height ?? '1rem'};
	min-height: ${({ $height }): string => $height ?? '1rem'};
	border-radius: ${({ $radius }): string => $radius ?? '0.125rem'};
	background: ${({ theme }): string => theme.palette.gray2.regular};
`;

const Loader = (): ReactElement => (
	<Container
		data-testid={'dropdown-options-loader'}
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="center"
		minWidth="16rem"
		minHeight="2rem"
	>
		<SkeletonTile $radius="50%" $width="2rem" $height="2rem" />
		<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
			<SkeletonTile
				$radius="0.25rem"
				$width={`${Math.random() * 9.375 + 4}rem`}
				$height="0.875rem"
				style={{ marginBottom: '0.25rem' }}
			/>
			<SkeletonTile
				$radius="0.25rem"
				$width={`${Math.random() * 9.375 + 4}rem`}
				$height="0.75rem"
			/>
		</Container>
	</Container>
);

export const normalizeResources = (r: Contact): Resource => ({
	id: r.id,
	label: r.fileAsStr,
	email: r._attrs.email,
	type: r._attrs.zimbraCalResType
});

export const EditorResourceComponent = ({
	editorId,
	onChange,
	placeholder,
	resourcesValue,
	onSearchOptions,
	warningLabel,
	disabled,
	singleWarningLabel,
	invalidInputErrorLabel
}: {
	editorId: string;
	onChange: (items: Array<Resource>) => void;
	onSearchOptions: (stringToSearch: string) => Promise<Array<ResourceInputOption>>;
	placeholder: string;
	resourcesValue: Array<Resource>;
	warningLabel: string;
	disabled?: boolean;
	singleWarningLabel: string;
	invalidInputErrorLabel: string;
}): JSX.Element | null => {
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));
	const [options, setOptions] = useState<Array<ResourceInputOption>>([]);
	const [hasError, setHasError] = useState(false);

	const attendeesAvailabilityList = useAttendeesAvailability(start, resourcesValue, uid);

	const isValidResource = (resource: Resource | undefined): boolean =>
		!!resource?.label?.trim() && !!resource?.email?.trim();

	const handleAdd = useCallback((valueToAdd: unknown): ChipItem<Resource> => {
		const isResourceOption = (obj: unknown): obj is Resource =>
			typeof obj === 'object' &&
			obj !== null &&
			'id' in obj &&
			'label' in obj &&
			'email' in obj &&
			'type' in obj;

		const isStringInput = (input: unknown): input is string =>
			typeof input === 'string' && input.trim() !== '';

		let label: string;
		let resource: Resource;

		if (isResourceOption(valueToAdd)) {
			resource = valueToAdd;
			label = resource.label;
		} else if (isStringInput(valueToAdd)) {
			label = valueToAdd.trim();
			resource = { email: '', label };
		} else {
			label = 'Invalid input';
			resource = { email: '', label };
		}

		const isValid = isValidResource(resource);

		return {
			label,
			value: resource,
			...(isValid ? {} : { background: 'error', hasError: true })
		};
	}, []);

	const handleInputType = useCallback<NonNullable<ChipInputProps<Resource>['onInputType']>>(
		(e) => {
			if (e.textContent && e.textContent !== '') {
				setOptions([
					{
						id: 'loading',
						label: 'loading',
						customComponent: <Loader />,
						disabled: true
					}
				]);
				onSearchOptions(e.textContent)
					.then((receivedOptions) => {
						setOptions(receivedOptions);
					})
					.catch(() => {
						// ignore
					});
			}
		},
		[onSearchOptions]
	);

	const handleChange: (newChips: ChipItem<Resource>[]) => void = useCallback(
		(newChips: ChipItem<Resource>[]) => {
			if (!onChange) return;

			const uniqueItems = uniqBy(newChips, 'label');
			setHasError(uniqueItems.some((item) => !isValidResource(item.value)));
			onChange(uniqueItems.map((chip) => chip.value as Resource));
		},
		[onChange]
	);

	const resourceAvailability: ChipItem<Resource>[] = useMemo(() => {
		if (!resourcesValue?.length) return [];

		return resourcesValue.map((room) => {
			const roomInList = find(attendeesAvailabilityList, ['email', room.email]);
			const resourceIsValid = isValidResource(room);

			let avatarIcon: keyof Theme['icons'];
			let avatarBackground: keyof Theme['palette'];
			if (!resourceIsValid) {
				avatarIcon = 'AlertCircleOutline';
				avatarBackground = 'error';
			} else if (room.type === 'Location') {
				avatarIcon = 'BuildingOutline';
				avatarBackground = 'transparent';
			} else {
				avatarIcon = 'BriefcaseOutline';
				avatarBackground = 'transparent';
			}

			const baseChip: ChipItem<Resource> = {
				...room,
				value: room,
				background: resourceIsValid ? 'gray3' : 'error',
				avatarIcon,
				avatarBackground,
				avatarColor: resourceIsValid ? 'gray0' : 'gray6',
				color: resourceIsValid ? 'text' : 'gray6'
			};

			if (roomInList) {
				const isBusy = getIsBusyAtTimeOfTheEvent(
					roomInList,
					start,
					end,
					attendeesAvailabilityList,
					allDay
				);

				if (isBusy) {
					return {
						...baseChip,
						actions: [
							{
								id: 'unavailable',
								label: singleWarningLabel,
								color: 'error',
								type: 'icon',
								icon: 'AlertTriangle'
							}
						]
					};
				}
			}

			return baseChip;
		});
	}, [allDay, attendeesAvailabilityList, end, resourcesValue, singleWarningLabel, start]);

	return (
		<>
			<Container width="100%" height="100%">
				<ChipInput
					disabled={disabled}
					confirmChipOnBlur
					createChipOnPaste={false}
					disableOptions={false}
					separators={[{ key: 'Enter', ctrlKey: false }]}
					placeholder={placeholder}
					value={resourceAvailability}
					options={options}
					onChange={handleChange}
					onAdd={handleAdd}
					onInputType={handleInputType}
					hasError={hasError}
					description={hasError ? invalidInputErrorLabel : undefined}
				/>
			</Container>
			<EditorAvailabilityWarningRow
				label={warningLabel}
				list={attendeesAvailabilityList}
				items={resourceAvailability}
				editorId={editorId}
			/>
		</>
	);
};
