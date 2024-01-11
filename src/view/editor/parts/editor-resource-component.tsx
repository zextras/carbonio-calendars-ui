/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useMemo, useRef } from 'react';

import {
	ChipInput,
	ChipInputProps,
	Container,
	DropdownItem,
	KeyboardPresetObj,
	useKeyboard
} from '@zextras/carbonio-design-system';
import { find, map } from 'lodash';
import { useTranslation } from 'react-i18next';
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

export const Loader = (): ReactElement => (
	<Container
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

export const normalizeResources = (
	r: Contact
): { id: string; label: string; value: string; email: string; type: string } => ({
	id: r.id,
	label: r.fileAsStr,
	value: r.fileAsStr,
	email: r._attrs.email,
	type: r._attrs.zimbraCalResType
});

export const EditorResourceComponent = ({
	editorId,
	onChange,
	placeholder,
	resourcesValue,
	onInputType,
	options,
	setOptions,
	warningLabel
}: {
	editorId: string;
	onChange: (e: Array<Resource>) => void;
	onInputType: ChipInputProps['onInputType'];
	placeholder: string;
	resourcesValue: Array<ChipResource>;
	options: Array<DropdownItem>;
	setOptions: (e: Array<DropdownItem>) => void;
	warningLabel: string;
}): JSX.Element | null => {
	const [t] = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);

	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));

	const attendeesAvailabilityList = useAttendeesAvailability(start, resourcesValue, uid);

	const onAdd = useCallback((valueToAdd) => {
		if (typeof valueToAdd === 'string') {
			return { label: valueToAdd };
		}
		const defaultLabel = {
			label: 'no label'
		};
		if (valueToAdd !== null && typeof valueToAdd === 'object') {
			return {
				...defaultLabel,
				...valueToAdd
			};
		}
		return defaultLabel;
	}, []);

	const resourceAvailability = useMemo(() => {
		if (!resourcesValue?.length) {
			return [];
		}
		return map(resourcesValue, (room) => {
			const roomInList = find(attendeesAvailabilityList, ['email', room.email]);

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
							label: t(
								'attendee_unavailable',
								'Attendee not available at the selected time of the event'
							),
							color: 'error',
							type: 'icon',
							icon: 'AlertTriangle'
						} as const
					];
					return {
						...room,
						actions
					};
				}
			}
			return room;
		});
	}, [allDay, attendeesAvailabilityList, end, resourcesValue, start, t]);

	const backspaceEvent = useMemo<KeyboardPresetObj[]>(
		() => [
			{
				type: 'keydown',
				callback: (): void => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					if (options?.[0]?.value && onChange && options?.[0]?.id !== 'loading') {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						onChange([...resourceAvailability, options[0].value]);
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
		[onChange, options, resourceAvailability, setOptions]
	);

	useKeyboard(inputRef, backspaceEvent);

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
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					onChange={onChange}
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
