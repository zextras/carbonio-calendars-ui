/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useContext } from 'react';
import { ModalManagerContext } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback, useTags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { editAppointmentFromInvite, moveApptToTrash } from './use-event-actions';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';

export const useQuickActions = (event, context = {}) => {
	const [t] = useTranslation();
	const replaceHistory = useReplaceHistoryCallback();
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	return event?.resource?.iAmOrganizer
		? [
				applyTag({
					event,
					context: {
						replaceHistory,
						createModal,
						dispatch,
						...context,
						isInstance: true,
						tags,
						createAndApplyTag
					},
					t
				}),
				editAppointmentFromInvite(event, { replaceHistory, createModal, dispatch, ...context }, t),
				moveApptToTrash(
					event,
					{ replaceHistory, createModal, dispatch, ...context, isInstance: true, tags },
					t
				)
		  ]
		: [
				applyTag({
					event,
					context: {
						replaceHistory,
						createModal,
						dispatch,
						...context,
						isInstance: true,
						tags,
						createAndApplyTag
					},
					t
				})
		  ];
};
