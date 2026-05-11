/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useEffect, useRef } from 'react';

import { useBoard, useBoardHooks } from '@zextras/carbonio-shell-ui';

import { EditorPanel } from './editor-panel';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectEditorIsDirty } from '../../store/selectors/editor';
import { setPendingCloseConfirmation } from '../../store/slices/editor-slice';

const BoardEditPanel = (): ReactElement | null => {
	const board = useBoard();
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const editorId: string | undefined = board?.editor?.id;
	const dispatch = useAppDispatch();
	const isDirty = useAppSelector(selectEditorIsDirty(editorId ?? ''));
	const isDirtyRef = useRef(isDirty);
	// Update every render so the onClose closure always reads the latest value
	isDirtyRef.current = isDirty;

	const boardHooks = useBoardHooks();
	const { updateBoard } = boardHooks;

	useEffect(() => {
		updateBoard({
			onClose: () => {
				if (isDirtyRef.current && editorId) {
					dispatch(
						setPendingCloseConfirmation({
							editorId,
							boardTitle: board?.title ?? ''
						})
					);
				}
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateBoard]);

	if (!editorId) {
		return null;
	}

	return <EditorPanel editorId={editorId} />;
};
export default BoardEditPanel;
