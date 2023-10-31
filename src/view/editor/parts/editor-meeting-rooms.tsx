/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import { compact, find, map, xorBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorMeetingRoom } from '../../../store/selectors/editor';
import { editEditorMeetingRoom } from '../../../store/slices/editor-slice';
import { useMeetingRooms } from '../../../store/zustand/hooks';
import { MeetingRoom } from '../../../types/editor';

export const EditorMeetingRooms = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const meetingRoom = useAppSelector(selectEditorMeetingRoom(editorId));
	const [selection, setSelection] = useState<Array<MeetingRoom> | undefined>(undefined);
	const dispatch = useAppDispatch();
	const meetingRooms = useMeetingRooms();

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

	return meetingRooms ? (
		<Select
			items={meetingRooms}
			background={'gray5'}
			label={t('label.meeting_room', 'Meeting room')}
			onChange={onChange}
			disabled={disabled?.meetingRoom}
			selection={selection}
			multiple
		/>
	) : null;
};
