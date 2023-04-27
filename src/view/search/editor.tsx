/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { useAppSelector } from '../../store/redux/hooks';
import { Header } from './header';
import { EditorPanel } from '../editor/editor-panel';
import { selectSearchActiveId } from '../../store/selectors/editor';

export const Editor = (): ReactElement | null => {
	const editorId = useAppSelector(selectSearchActiveId);

	const close = useCallback(() => {
		replaceHistory('');
	}, []);

	return editorId ? (
		<Container
			mainAlignment="flex-start"
			padding={{ bottom: 'medium' }}
			style={{ overflowY: 'hidden' }}
		>
			<Header title={''} closeAction={close} actions={[]} />
			<EditorPanel editorId={editorId} />
		</Container>
	) : null;
};
// todo: header actions!
