/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBoardConfig } from '@zextras/carbonio-shell-ui';
import React, { useMemo } from 'react';
import { useEditor } from '../../hooks/use-editor';
import { EditorPanel } from './editor-panel';

const BoardEditPanel = (): JSX.Element | null => {
	const board = useBoardConfig<any>();

	const id = useMemo(() => board?.event?.resource.id ?? 'new', [board?.event?.resource.id]);

	const { editorId, callbacks } = useEditor(id);

	return editorId ? <EditorPanel editorId={editorId} callbacks={callbacks} /> : null;
};
export default BoardEditPanel;
