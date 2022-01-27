/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useBoardConfig } from '@zextras/carbonio-shell-ui';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { useQueryParam } from '../../commons/useQueryParam';
import { useId } from '../../hooks/use-id';
import { useEditorDispatches } from '../../hooks/use-editor-dispatches';
import EditorCompleteView from './editor-complete-view';
import EditorSmallView from './editor-small-view';

export default function EditorController({
	setTitle,
	panelIsExpanded = false,
	action = 'new',
	event,
	hideActions
}) {
	const boardContext = useBoardConfig();
	const editorId = useQueryParam('edit');
	const updateAppTime = useQueryParam('updateTime');
	const selectedStartTime = useQueryParam('start');
	const selectedEndTime = useQueryParam('end');

	const { id, data } = useId(
		action === 'new' && !editorId ? action : editorId,
		boardContext?.isBoard,
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
	const callbacks = useEditorDispatches(id, boardContext?.isBoard);

	if (panelIsExpanded)
		return (
			<EditorCompleteView
				setTitle={setTitle}
				data={data}
				callbacks={callbacks}
				invite={boardContext?.proposeNewTime ? boardContext.invite : invite}
				updateAppTime={!!updateAppTime}
				proposeNewTime={!!boardContext?.proposeNewTime}
			/>
		);
	return (
		<EditorSmallView
			editorId={editorId}
			setTitle={setTitle}
			data={data}
			proposeNewTime={!!boardContext?.proposeNewTime}
			callbacks={callbacks}
			invite={boardContext?.proposeNewTime ? boardContext.invite : invite}
			updateAppTime={!!updateAppTime}
			hideActions={hideActions}
		/>
	);
}
