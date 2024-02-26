/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, isNil, omitBy } from 'lodash';

import {
	moveAppointmentToTrash,
	MoveAppointmentToTrashArguments
} from '../store/actions/move-appointment-to-trash';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { AppDispatch } from '../store/redux';
import { EventType } from '../types/event';
import { isOrganizerOrHaveEqualRights } from '../utils/store/event';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const generateSnackbar = ({ res, t, createSnackbar }: any): any => {
	if (!res.type.includes('fulfilled')) {
		createSnackbar({
			key: `delete`,
			replace: true,
			type: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000
		});
	}
};

export const sendResponse = (event: EventType, context: { dispatch: AppDispatch }): Promise<any> =>
	context.dispatch(
		sendInviteResponse({
			inviteId: event.resource.inviteId,
			updateOrganizer: true,
			action: 'DECLINE'
		})
	);

export const deleteEvent = (
	event: EventType,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	context: any
): any => {
	const absFolderPath = find(context.folders, ['id', event.resource.calendar.id])?.absFolderPath;
	const { inviteId, id, isRecurrent, ridZ } = event.resource;
	const moveToTrashArgs = omitBy(
		{
			inviteId,
			ridZ,
			t: context.t,
			recur: context?.recur,
			isRecurrent,
			isOrganizer: isOrganizerOrHaveEqualRights(event, absFolderPath),
			deleteSingleInstance: context.isInstance ?? true,
			newMessage: context.newMessage,
			inst: context?.inst,
			s: context.s,
			id
		},
		isNil
	) as MoveAppointmentToTrashArguments;
	return context.dispatch(moveAppointmentToTrash(moveToTrashArgs));
};
