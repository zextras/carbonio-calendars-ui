/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { ActionsContext } from '../types/actions';
import { Invite } from '../types/store/invite';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';
import { editAppointmentItem, moveApptToTrashItem } from '../actions/action-items';

export const useQuickActions = (invite: Invite, context: ActionsContext): any => {
	const [t] = useTranslation();
	const tags = useTags();
	return invite?.isOrganizer
		? [
				applyTag({
					invite,
					context: {
						...context,
						tags,
						createAndApplyTag
					},
					t
				}),
				editAppointmentItem(invite, context, t),
				moveApptToTrashItem(invite, { ...context, tags }, t)
		  ]
		: [
				applyTag({
					invite,
					context: {
						...context,
						tags,
						createAndApplyTag
					},
					t
				})
		  ];
};
