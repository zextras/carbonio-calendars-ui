/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { createCallbacks } from '../../commons/editor-generator';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectSearchActiveId } from '../../store/selectors/editor';
import { EditorPanel } from '../editor/editor-panel';
import { Header } from './header';

export const Editor = (): ReactElement | null => {
	const editorId = useAppSelector(selectSearchActiveId);
	const dispatch = useAppDispatch();
	const callbacks = useMemo(
		() => (editorId ? createCallbacks(editorId, { dispatch }) : undefined),
		[dispatch, editorId]
	);
	const close = useCallback(() => {
		replaceHistory('');
	}, []);
	return editorId && callbacks ? (
		<Container
			mainAlignment="flex-start"
			padding={{ bottom: 'medium' }}
			style={{ overflowY: 'hidden' }}
		>
			<Header title={''} closeAction={close} actions={[]} />
			<EditorPanel editorId={editorId} callbacks={callbacks} />
		</Container>
	) : null;
};
// todo: header actions!
