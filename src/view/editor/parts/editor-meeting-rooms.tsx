/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { filter, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EditorResourceComponent, normalizeResources } from './editor-resource-component';
import { generateResourceId, isValidResource } from './utils';
import { searchResources } from '../../../soap/search-resources';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorMeetingRoom } from '../../../store/selectors/editor';
import { editEditorMeetingRoom } from '../../../store/slices/editor-slice';
import { ChipResource } from '../../../types/editor';

export const EditorMeetingRooms = ({ editorId }: { editorId: string }): ReactElement | null => {
	const dispatch = useAppDispatch();
	const [t] = useTranslation();
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const meetingRoomsValue = useAppSelector(selectEditorMeetingRoom(editorId));

	const meetingRoomsChipValue = useMemo(
		() =>
			map(meetingRoomsValue, (resource) => {
				const isValid = isValidResource(resource);
				return {
					id: resource.id ?? generateResourceId(resource),
					label: resource.label,
					email: resource.email,
					avatarIcon: isValid ? 'BuildingOutline' : 'AlertCircleOutline',
					avatarBackground: 'transparent' as const,
					avatarColor: 'gray0' as const
				};
			}),
		[meetingRoomsValue]
	);

	const onChange = useCallback(
		(chips: Array<ChipResource>) => {
			dispatch(editEditorMeetingRoom({ id: editorId, meetingRoom: chips }));
		},
		[dispatch, editorId]
	);

	const onSearchOptions = useCallback(
		(searchedValue: string) =>
			searchResources(searchedValue).then((response) => {
				if (response && !response.error) {
					const meetingResources = filter(
						response.cn,
						(cn) => cn._attrs.zimbraCalResType === 'Location'
					);
					return map(meetingResources, (result) => ({
						id: result.fileAsStr,
						label: result.fileAsStr,
						icon: 'BuildingOutline',
						value: normalizeResources(result)
					}));
				}
				throw new Error('API failed');
			}),
		[]
	);

	const errorLabels = {
		singleResourceUnavailable: t(
			'attendee_room_unavailable',
			'Room not available at the selected time of the event'
		),
		multipleResourcesUnavailable: t(
			'attendees_rooms_unavailable',
			'One or more Meeting Rooms are not available at the selected time of the event'
		),
		invalidResource: t(
			'rooms_invalid',
			'One or more Meeting rooms are invalid. Try editing them or entering a new one.'
		),
		duplicateResources: t(
			'duplicate_rooms_error',
			'One or more Meeting rooms were selected multiple times. Consider removing the duplicates.'
		)
	};
	return (
		<EditorResourceComponent
			onChange={onChange}
			editorId={editorId}
			onSearchOptions={onSearchOptions}
			placeholder={t('label.meeting_room', 'Meeting room')}
			resourcesValue={meetingRoomsChipValue ?? []}
			disabled={disabled?.equipment}
			errorLabels={errorLabels}
		/>
	);
};
