/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from '@zextras/carbonio-design-system';
import { selectEditorDisabled, selectEditorRoom } from '../../../store/selectors/editor';
import { editEditorRoom } from '../../../store/slices/editor-slice';

type EditorRoomProps = {
	editorId: string;
};

export const EditorVirtualRoom = ({ editorId }: EditorRoomProps): ReactElement | null => {
	const [RoomSelector, isRoomAvailable] = useIntegratedComponent('room-selector');
	const room = useSelector(selectEditorRoom(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

	const onChange = useCallback(
		(roomData) => {
			dispatch(editEditorRoom({ id: editorId, room: roomData }));
		},
		[dispatch, editorId]
	);

	return isRoomAvailable ? (
		<Row height="fit" width="fill" padding={{ top: 'large' }}>
			<RoomSelector onChange={onChange} defaultValue={room} disabled={disabled?.virtualRoom} />
		</Row>
	) : null;
};
