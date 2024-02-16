/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { ReactElement, useCallback } from 'react';

import { Row } from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorRoom } from '../../../store/selectors/editor';
import { editEditorRoom } from '../../../store/slices/editor-slice';

export const EditorVirtualRoom = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [RoomSelector, isRoomAvailable] = useIntegratedComponent('room-selector');
	const room = useAppSelector(selectEditorRoom(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const dispatch = useAppDispatch();

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
