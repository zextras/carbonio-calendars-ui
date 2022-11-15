/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from './header';
import { EditorPanel } from '../editor/editor-panel';
import { selectSearchActiveId } from '../../store/selectors/editor';
import { createCallbacks } from '../../commons/editor-generator';

export const Editor = (): ReactElement | null => {
	const editorId = useSelector(selectSearchActiveId);
	const dispatch = useDispatch();
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
