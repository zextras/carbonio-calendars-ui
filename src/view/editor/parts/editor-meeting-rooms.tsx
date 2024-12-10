/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { filter, map, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EditorResourceComponent, normalizeResources } from './editor-resource-component';
import { searchResources } from '../../../soap/search-resources';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorMeetingRoom } from '../../../store/selectors/editor';
import { editEditorMeetingRoom } from '../../../store/slices/editor-slice';
import { useAppStatusStore } from '../../../store/zustand/store';
import { ChipResource } from '../../../types/editor';

export const EditorMeetingRooms = ({ editorId }: { editorId: string }): ReactElement | null => {
	const dispatch = useAppDispatch();
	const [t] = useTranslation();
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const meetingRoomsValue = useAppSelector(selectEditorMeetingRoom(editorId));

	const meetingRoomsChipValue: Array<ChipResource> = useMemo(
		() =>
			map(meetingRoomsValue, (result) => ({
				id: result.id,
				label: result.label,
				email: result.email,
				avatarIcon: 'BuildingOutline',
				avatarBackground: 'transparent',
				avatarColor: 'gray0'
			})),
		[meetingRoomsValue]
	);

	const onChange = useCallback(
		(chips: Array<ChipResource>) => {
			if (chips) {
				const newValue = chips.length > 0 ? uniqBy(chips, 'label') : [];
				dispatch(editEditorMeetingRoom({ id: editorId, meetingRoom: newValue }));
			}
		},
		[dispatch, editorId]
	);

	const placeholder = useMemo(() => t('label.meeting_room', 'Meeting room'), [t]);
	const warningLabel = useMemo(
		() =>
			t(
				'attendees_rooms_unavailable',
				'One or more Meeting Rooms are not available at the selected time of the event'
			),
		[t]
	);
	const singleWarningLabel = useMemo(
		() => t('attendee_room_unavailable', 'Room not available at the selected time of the event'),
		[t]
	);
	const onSearchOptions = useCallback(
		(searchedValue: string) =>
			searchResources(searchedValue).then((response) => {
				if (!response.error) {
					const meetingResources = filter(
						response.cn,
						(cn) => cn._attrs.zimbraCalResType === 'Location'
					);
					const remoteResources = map(meetingResources, (result) => normalizeResources(result));

					const res = map(meetingResources, (result) => ({
						id: result.fileAsStr,
						label: result.fileAsStr,
						icon: 'BuildingOutline',
						value: normalizeResources(result)
					}));
					useAppStatusStore.setState({ meetingRoom: uniqBy(remoteResources, 'label') });
					return res;
				}
				throw new Error('API failed');
			}),
		[]
	);

	return (
		<EditorResourceComponent
			onChange={onChange}
			editorId={editorId}
			onSearchOptions={onSearchOptions}
			placeholder={placeholder}
			resourcesValue={meetingRoomsChipValue ?? []}
			warningLabel={warningLabel}
			disabled={disabled?.equipment}
			singleWarningLabel={singleWarningLabel}
		/>
	);
};
