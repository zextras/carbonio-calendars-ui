/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { useParams } from 'react-router-dom';
import { useBoardConfig } from '@zextras/carbonio-shell-ui';
import { useSelector } from 'react-redux';
import { Header } from './header';
import { useSearchActionsFn } from './hooks/use-search-actions-fn';
import EditorCompleteView from '../event-panel-edit/editor-complete-view';
import { useQueryParam } from '../../commons/useQueryParam';
import { useId } from '../../hooks/use-id';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { useEditorDispatches } from '../../hooks/use-editor-dispatches';

export const Editor = ({ event, actions }) => {
	const { action } = useParams();
	const { close } = useSearchActionsFn(event);
	const boardContext = useBoardConfig();
	const editorId = useQueryParam('edit');
	const updateAppTime = useQueryParam('updateTime');
	const selectedStartTime = useQueryParam('start');
	const selectedEndTime = useQueryParam('end');

	const { id, data } = useId(
		action === 'new' && !editorId ? action : editorId,
		null,
		boardContext?.event ? boardContext.event : event,
		selectedStartTime,
		selectedEndTime,
		boardContext?.invite
	);
	const invite = useSelector(
		(state) =>
			selectInstanceInvite(state, event?.resource.inviteId, event?.resource.ridZ) ||
			boardContext?.invite
	);
	const callbacks = useEditorDispatches(id);
	return (
		<Container mainAlignment="flex-start" padding={{ vertical: 'medium' }}>
			<Header title={event.title} actions={actions} closeAction={close} />
			<EditorCompleteView
				data={data}
				callbacks={callbacks}
				invite={boardContext?.proposeNewTime ? boardContext.invite : invite}
				updateAppTime={!!updateAppTime}
				proposeNewTime={!!boardContext?.proposeNewTime}
			/>
		</Container>
	);
};
