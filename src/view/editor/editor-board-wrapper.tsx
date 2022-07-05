/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBoardConfig } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { EditorPanel } from './editor-panel';

const BoardEditPanel = (): JSX.Element | null => {
	const board = useBoardConfig<any>();

	return board?.id ? <EditorPanel editorId={board?.id} callbacks={board.callbacks} /> : null;
};
export default BoardEditPanel;
