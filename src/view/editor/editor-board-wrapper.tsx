/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Board, useBoard } from '@zextras/carbonio-shell-ui';
import React, { ReactElement } from 'react';
import { createCallbacks } from '../../commons/editor-generator';
import { EditorCallbacks } from '../../types/editor';
import { EditorPanel } from './editor-panel';

const BoardEditPanel = (): ReactElement | null => {
	const board = useBoard() as Board & { callbacks: EditorCallbacks };
	const callbacks = board?.editorId ? createCallbacks(board?.editorId) : undefined;

	return board?.editorId && callbacks ? (
		<EditorPanel editorId={board?.editorId} callbacks={callbacks} />
	) : null;
};
export default BoardEditPanel;
