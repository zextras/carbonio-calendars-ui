/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Icon,
	Padding,
	Row,
	Select,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { compact, find, map, xorBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorMeetingRoom,
	selectEditorStart,
	selectEditorUid
} from '../../../store/selectors/editor';
import { editEditorMeetingRoom } from '../../../store/slices/editor-slice';
import { useMeetingRooms } from '../../../store/zustand/hooks';
import { Resource } from '../../../types/editor';

export const EditorMeetingRooms = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const meetingRoom = useAppSelector(selectEditorMeetingRoom(editorId));
	const [selection, setSelection] = useState<Array<Resource> | undefined>(undefined);
	const dispatch = useAppDispatch();
	const meetingRooms = useMeetingRooms();
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));

	const attendeesAvailabilityList = useAttendeesAvailability(start, meetingRooms, uid);

	const onChange = useCallback(
		(e) => {
			if (e) {
				if (e.length > 0) {
					dispatch(editEditorMeetingRoom({ id: editorId, meetingRoom: e }));
				} else {
					dispatch(editEditorMeetingRoom({ id: editorId, meetingRoom: [] }));
				}
			}
			setSelection(e);
		},
		[dispatch, editorId]
	);

	useEffect(() => {
		if (meetingRoom && meetingRoom?.length > 0) {
			const selected = compact(
				map(meetingRoom, (room) => find(meetingRooms, (r) => room.email === r.email))
			);
			if (selected.length > 0 && xorBy(selected, selection, 'id')?.length > 0) {
				setSelection(selected);
			}
		}
	}, [meetingRoom, meetingRooms, selection]);

	const meetingRoomsAvailability = useMemo(() => {
		if (!meetingRooms?.length) {
			return [];
		}
		return map(meetingRooms, (room) => {
			const roomInList = find(attendeesAvailabilityList, ['email', room.email]);
			const isSelected = find(selection, ['email', room.email]);

			if (roomInList) {
				const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
					roomInList,
					start,
					end,
					attendeesAvailabilityList,
					allDay
				);

				if (isBusyAtTimeOfEvent) {
					return {
						...room,
						email: room?.email ?? room?.label,
						customComponent: (
							<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
								<Icon icon={(isSelected && 'CheckmarkSquare') || 'Square' || ''} />
								<Padding horizontal={'small'}>
									<Text weight={isSelected ? 'bold' : 'regular'}>{room?.label}</Text>
								</Padding>
								<Tooltip
									label={t(
										'attendee_room_unavailable',
										'Room not available at the selected time of the event'
									)}
								>
									<Row>
										<Icon icon="AlertTriangle" color="error" />
									</Row>
								</Tooltip>
							</Container>
						)
					};
				}
			}
			return {
				...room,
				email: room?.email ?? room?.label
			};
		});
	}, [allDay, attendeesAvailabilityList, end, meetingRooms, selection, start, t]);

	return meetingRoomsAvailability ? (
		<>
			<Select
				items={meetingRoomsAvailability}
				background={'gray5'}
				label={t('label.meeting_room', 'Meeting room')}
				onChange={onChange}
				disabled={disabled?.meetingRoom}
				selection={selection}
				multiple
			/>
			<EditorAvailabilityWarningRow
				label={t(
					'attendees_rooms_unavailable',
					'One or more Meeting Rooms are not available at the selected time of the event'
				)}
				list={attendeesAvailabilityList}
				items={meetingRoom ?? []}
				editorId={editorId}
			/>
		</>
	) : null;
};
