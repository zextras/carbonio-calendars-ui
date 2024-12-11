/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import {
	ChipInput,
	ChipInputProps,
	ChipItem,
	Container,
	DropdownItem,
	KeyboardPresetObj,
	useKeyboard
} from '@zextras/carbonio-design-system';
import { find, map, reduce } from 'lodash';
import styled, { DefaultTheme } from 'styled-components';

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
import { ChipResource, Resource } from '../../../types/editor';
import { Contact } from '../../../types/soap/soap-actions';

interface SkeletonTileProps {
	width?: string;
	height?: string;
	radius?: string;
	theme: DefaultTheme;
}
type ResourceInputOption = DropdownItem & { value?: Resource };

const SkeletonTile = styled.div<SkeletonTileProps>`
	width: ${({ width }): string => width ?? '1rem'};
	max-width: ${({ width }): string => width ?? '1rem'};
	min-width: ${({ width }): string => width ?? '1rem'};
	height: ${({ height }): string => height ?? '1rem'};
	max-height: ${({ height }): string => height ?? '1rem'};
	min-height: ${({ height }): string => height ?? '1rem'};
	border-radius: ${({ radius }): string => radius ?? '0.125rem'};
	background: ${({ theme }): string => theme.palette.gray2.regular};
`;

const addOption = (optionValue: Resource): ChipItem<Resource> => ({
	id: optionValue.id,
	label: optionValue.label,
	value: optionValue
});

const Loader = (): ReactElement => (
	<Container
		data-testid={'dropdown-options-loader'}
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="center"
		minWidth="16rem"
		minHeight="2rem"
	>
		<SkeletonTile radius="50%" width="2rem" height="2rem" />
		<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
			<SkeletonTile
				radius="0.25rem"
				width={`${Math.random() * 9.375 + 4}rem`}
				height="0.875rem"
				style={{ marginBottom: '0.25rem' }}
			/>
			<SkeletonTile radius="0.25rem" width={`${Math.random() * 9.375 + 4}rem`} height="0.75rem" />
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
	singleWarningLabel
}: {
	editorId: string;
	onChange: (items: ChipResource[]) => void;
	onSearchOptions: (stringToSearch: string) => Promise<Array<ResourceInputOption>>;
	placeholder: string;
	resourcesValue: Array<ChipResource>;
	warningLabel: string;
	disabled?: boolean;
	singleWarningLabel: string;
}): JSX.Element | null => {
	const inputRef = useRef<HTMLInputElement>(null);

	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));

	const [options, setOptions] = useState<Array<ResourceInputOption>>([]);

	const attendeesAvailabilityList = useAttendeesAvailability(start, resourcesValue, uid);

	const onAdd = useCallback((valueToAdd: unknown): ChipItem<Resource> => {
		const resourceFromOptions = valueToAdd as Resource;
		return addOption(resourceFromOptions);
	}, []);

	const onInputType = useCallback<NonNullable<ChipInputProps<Resource>['onInputType']>>(
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

	const onInternalChange = useCallback(
		(items: ChipItem<Resource>[]) => {
			const itemsWithValue = reduce(
				items,
				(acc, item) => {
					const { value, label } = item;
					if (label && value) {
						acc.push({ label, email: value.email });
					}
					return acc;
				},
				[] as ChipResource[]
			);

			onChange(itemsWithValue);
		},
		[onChange]
	);

	const resourceAvailability: ChipItem<Resource>[] = useMemo(() => {
		if (!resourcesValue?.length) {
			return [];
		}
		return map(resourcesValue, (room) => {
			const roomInList = find(attendeesAvailabilityList, ['email', room.email]);
			const chipRoom = { ...room, value: room };
			if (roomInList) {
				const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
					roomInList,
					start,
					end,
					attendeesAvailabilityList,
					allDay
				);

				if (isBusyAtTimeOfEvent) {
					const actions = [
						{
							id: 'unavailable',
							label: singleWarningLabel,
							color: 'error',
							type: 'icon',
							icon: 'AlertTriangle'
						} as const
					];
					return {
						...chipRoom,
						actions
					};
				}
			}
			return chipRoom;
		});
	}, [allDay, attendeesAvailabilityList, end, resourcesValue, singleWarningLabel, start]);

	const onPressingEnterSelectFirstOption = useMemo<KeyboardPresetObj[]>(
		() => [
			{
				type: 'keydown',
				callback: (): void => {
					if (options?.[0]?.value && onInternalChange && options?.[0]?.id !== 'loading') {
						const { value } = options[0];
						onInternalChange([addOption(value)]);
						if (inputRef.current) {
							inputRef.current.value = '';
							setOptions([]);
						}
					}
				},
				keys: [{ key: 'Enter', ctrlKey: false }],
				haveToPreventDefault: true
			}
		],
		[onInternalChange, options]
	);

	useKeyboard(inputRef, onPressingEnterSelectFirstOption);

	return (
		<>
			<Container width="100%" height="100%">
				<ChipInput
					inputRef={inputRef}
					confirmChipOnBlur={false}
					placeholder={placeholder}
					separators={[]}
					value={resourceAvailability}
					options={options}
					onInputType={onInputType}
					onAdd={onAdd}
					onChange={onInternalChange}
					disabled={disabled}
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
