/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { useSelector } from 'react-redux';
import { Header } from './header';
import { EditorPanel } from '../editor/editor-panel';
import { selectSearchActiveId } from '../../store/selectors/editor';
import { createCallbacks } from '../../commons/editor-generator';
import { useSearchActionsFn } from './hooks/use-search-actions-fn';

export const Editor = (): JSX.Element | null => {
	const editorId = useSelector(selectSearchActiveId);
	const callbacks = useMemo(() => (editorId ? createCallbacks(editorId) : undefined), [editorId]);
	const { close } = useSearchActionsFn();

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
