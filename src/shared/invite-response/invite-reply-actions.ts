/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { FOLDERS, useHistoryNavigation, Folder, LinkFolder } from '@zextras/carbonio-ui-commons';
import type { TFunction } from 'i18next';

import { moveAppointmentRequest } from '../../store/actions/move-appointment';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { AppDispatch } from '../../store/redux';
import { InstanceExceptionId } from '../../utils/event';
import { InviteReplyVerb, Msg } from 'soap/send-invite-reply-request';

type BaseResponseAction = {
	inviteId: string;
	action: InviteReplyVerb;
	dispatch: AppDispatch;
	replaceHistory: ReturnType<typeof useHistoryNavigation>['replaceHistory'];
	t: TFunction;
	activeCalendar: Folder | null;
	createSnackbar: CreateSnackbarFn;
	parent: string;
	exceptId?: InstanceExceptionId;
};

export type ResponseAction =
	| (BaseResponseAction & { notifyOrganizer: true; m: Msg })
	| (BaseResponseAction & { notifyOrganizer: false });

const handleInviteResponseResult = ({
	res,
	action,
	inviteId,
	parent,
	replaceHistory,
	t,
	activeCalendar,
	createSnackbar,
	dispatch
}: {
	res: { type: string };
	action: InviteReplyVerb;
	inviteId: string;
	parent: string;
	replaceHistory: ReturnType<typeof useHistoryNavigation>['replaceHistory'];
	t: TFunction;
	activeCalendar: Folder | null;
	createSnackbar: CreateSnackbarFn;
	dispatch: AppDispatch;
}): void => {
	if (res.type.includes('fulfilled')) {
		if (parent) {
			// FIXME: this is a workaround until CO-1823 and CO-1825 will be completed
			replaceHistory(`/mails/folder/${parent}`);
		}
		let snackbarLabel: string;
		switch (action) {
			case 'ACCEPT':
				snackbarLabel = t('message.snackbar.invite.accept', "You've replied as Accepted");
				break;
			case 'TENTATIVE':
				snackbarLabel = t('message.snackbar.invite.tentative', "You've replied as Tentative");
				break;
			default:
				snackbarLabel = t('message.snackbar.invite.decline', "You've replied as Declined");
				break;
		}
		createSnackbar({
			key: `invite_${action}`,
			replace: true,
			severity: 'info',
			label: snackbarLabel,
			autoHideTimeout: 3000
		});
		if (action === 'ACCEPT' || action === 'TENTATIVE') {
			const calendarId = activeCalendar?.id ?? (activeCalendar as LinkFolder)?.zid;
			calendarId &&
				calendarId !== FOLDERS.CALENDAR &&
				dispatch(
					moveAppointmentRequest({
						id: inviteId,
						l: calendarId || FOLDERS.CALENDAR
					})
				);
		}
	} else {
		createSnackbar({
			key: `invite_${action}_error`,
			replace: true,
			severity: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000
		});
	}
};

export const sendResponse = (args: ResponseAction): void => {
	const m = args.notifyOrganizer ? args.m : undefined;
	args
		.dispatch(
			// WHAT!?
			sendInviteResponse({
				inviteId: args.inviteId,
				updateOrganizer: args.notifyOrganizer,
				action: args.action,
				...(args.exceptId !== undefined && { exceptId: args.exceptId }),
				...(m !== undefined && { m })
			})
		)
		.then((res): void =>
			handleInviteResponseResult({
				res,
				action: args.action,
				inviteId: args.inviteId,
				parent: args.parent,
				replaceHistory: args.replaceHistory,
				t: args.t,
				activeCalendar: args.activeCalendar,
				createSnackbar: args.createSnackbar,
				dispatch: args.dispatch
			})
		);
};
