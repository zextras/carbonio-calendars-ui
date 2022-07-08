/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { ActionsContext } from '../types/actions';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';
import { editAppointmentItem, moveApptToTrashItem } from '../actions/action-items';

export const useQuickActions = (
	invite: Invite | undefined,
	event: EventType | undefined,
	context: ActionsContext
): any => {
	const [t] = useTranslation();
	const tags = useTags();
	if (!invite || !event) return [];
	return invite?.isOrganizer
		? [
				applyTag({
					event,
					context: {
						...context,
						tags,
						createAndApplyTag
					},
					t
				}),
				editAppointmentItem(
					invite,
					event,
					{
						...context,
						isSeries: event.resource.isRecurrent,
						isInstance: true,
						isException: event.resource.isException
					},
					t
				),
				moveApptToTrashItem(invite, event, { ...context, tags }, t)
		  ]
		: [
				applyTag({
					event,
					context: {
						...context,
						tags,
						createAndApplyTag
					},
					t
				})
		  ];
};
