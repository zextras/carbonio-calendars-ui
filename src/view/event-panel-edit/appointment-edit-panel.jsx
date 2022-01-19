/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import Panel from '../../commons/panel';
import EditorController from './editor-controller';
import { EventContext } from '../../commons/event-context';
import { useQuickActions } from '../../hooks/use-quick-actions';

export const EventEditPanel = ({ action, event, close }) => {
	const dispatch = useDispatch();
	const replaceHistory = useReplaceHistoryCallback();
	const utils = useContext(EventContext);
	const [t] = useTranslation();
	const actions = useQuickActions(event, { utils, replaceHistory, dispatch }, t);
	const [title, setTitle] = useState(null);

	return (
		<Panel closeAction={close} title={title} actions={actions} resizable hideActions>
			<EditorController
				setTitle={setTitle}
				action={action}
				closePanel={close}
				event={event}
				hideActions
			/>
		</Panel>
	);
};
