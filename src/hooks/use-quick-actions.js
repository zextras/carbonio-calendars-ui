/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useContext } from 'react';
import { ModalManagerContext } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { editAppointment, moveApptToTrash } from './use-event-actions';

export const useQuickActions = (event, context = {}) => {
	const [t] = useTranslation();
	const replaceHistory = useReplaceHistoryCallback();
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);

	return event?.resource?.iAmOrganizer
		? [
				editAppointment(event, { replaceHistory, createModal, dispatch, ...context }, t),
				moveApptToTrash(
					event,
					{ replaceHistory, createModal, dispatch, ...context, isInstance: true },
					t
				)
		  ]
		: [];
};
