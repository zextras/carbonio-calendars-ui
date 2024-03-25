/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, t } from '@zextras/carbonio-shell-ui';

import { Folder, LinkFolder } from '../../carbonio-ui-commons/types/folder';
import { moveAppointmentRequest } from '../../store/actions/move-appointment';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { AppDispatch } from '../../store/redux';

type ResponseAction = {
	inviteId: string;
	notifyOrganizer: boolean;
	action: string;
	dispatch: AppDispatch;
	activeCalendar: Folder | null;
	createSnackbar: CreateSnackbarFn;
	parent: string;
};
export const sendResponse = ({
	inviteId,
	notifyOrganizer,
	action,
	dispatch,
	activeCalendar,
	createSnackbar,
	parent
}: ResponseAction): void => {
	dispatch(
		sendInviteResponse({
			inviteId,
			updateOrganizer: notifyOrganizer,
			action
		})
	).then((res): void => {
		if (res.type.includes('fulfilled')) {
			if (parent) {
				replaceHistory(`/folder/${parent}`);
			}
			const snackbarLabel =
				// eslint-disable-next-line no-nested-ternary
				action === 'ACCEPT'
					? t('message.snackbar.invite.accept', 'You’ve replied as Accepted')
					: action === 'TENTATIVE'
						? t('message.snackbar.invite.tentative', 'You’ve replied as Tentative')
						: t('message.snackbar.invite.decline', 'You’ve replied as Declined');
			createSnackbar({
				key: `invite_${action}`,
				replace: true,
				type: 'info',
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
				type: 'error',
				label: t('label.error_try_again', 'Something went wrong, please try again'),
				autoHideTimeout: 3000
			});
		}
	});
};
