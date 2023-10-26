/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { useBoard } from '@zextras/carbonio-shell-ui';

import { EditorPanel } from './editor-panel';

const BoardEditPanel = (): ReactElement | null => {
	const board = useBoard();
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	if (!board?.editor?.id) {
		return null;
	}
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return <EditorPanel editorId={board?.editor?.id} />;
};
export default BoardEditPanel;
