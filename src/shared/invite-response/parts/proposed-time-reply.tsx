/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';
import React, { FC, ReactElement, useCallback, useContext } from 'react';

import {
	SnackbarManagerContext,
	Container,
	Padding,
	ButtonOld as Button,
	Divider
} from '@zextras/carbonio-design-system';
import { t, useIntegratedFunction } from '@zextras/carbonio-shell-ui';

import { generateEditor } from '../../../commons/editor-generator';
import { getAppointmentAndInvite } from '../../../commons/get-appointment';
import { useCalendarFolders } from '../../../hooks/use-calendar-folders';
import { appointmentToEvent } from '../../../hooks/use-invite-to-event';
import { normalizeAppointmentFromCreation } from '../../../normalizations/normalize-appointments';
import { normalizeInvite } from '../../../normalizations/normalize-invite';
import { modifyAppointment } from '../../../store/actions/new-modify-appointment';
import { useAppDispatch } from '../../../store/redux/hooks';
import { updateEditor } from '../../../store/slices/editor-slice';

type ProposedTimeReply = {
	id: string;
	inviteId: string;
	moveToTrash?: () => void;
	title: string;
	fragment: string;
	start: number;
	end: number;
	to: Array<{ address: string; fullName: string; name: string; type: string }>;
};
const ProposedTimeReply: FC<ProposedTimeReply> = ({
	id,
	inviteId,
	moveToTrash,
	title,
	fragment,
	start,
	end,
	to
}): ReactElement => {
	const createSnackbar = useContext(SnackbarManagerContext);
	const dispatch = useAppDispatch();
	const calendarFolders = useCalendarFolders();
	const [openComposer, available] = useIntegratedFunction('compose');
	const accept = useCallback(() => {
		getAppointmentAndInvite({ aptId: id, inviteId }).then((res) => {
			const { appointment, invite: _invite } = res;
			const normalizedAppointment = normalizeAppointmentFromCreation(appointment, {});
			const normalizedInvite = _invite.inv[0].comp
				? normalizeInvite(_invite)
				: normalizeInvite({ ..._invite, inv: appointment.inv });
			const requiredEvent = appointmentToEvent(normalizedInvite, normalizedAppointment.id);
			const editor = generateEditor({
				event: requiredEvent,
				invite: normalizedInvite,
				context: {
					attendees: map(normalizedInvite.attendees, (attendee) => ({ email: attendee.a })),
					start,
					end,
					folders: calendarFolders,
					dispatch,
					panel: false
				}
			});

			dispatch(modifyAppointment({ draft: false, editor })).then(({ payload }) => {
				const { response, error } = payload;
				if (response && !error) {
					dispatch(updateEditor({ id: payload.editor.id, editor: payload.editor }));
				}
				createSnackbar({
					key: error ? 'proposedTimeDeclined' : 'proposedTimeAccepted',
					replace: true,
					type: error ? 'error' : 'success',
					hideButton: true,
					label: error
						? t('label.error_try_again', 'Something went wrong, please try again')
						: t('snackbar.proposed_time_accepted', 'You accepted the proposed time'),
					autoHideTimeout: 3000
				});
				moveToTrash?.();
			});
		});
	}, [id, inviteId, start, end, calendarFolders, dispatch, createSnackbar, moveToTrash]);

	const decline = useCallback(() => {
		if (available)
			openComposer(null, {
				text: ['text', `${fragment}:`],
				subject: `${t('label.proposal_declined', 'Proposal declined')}${title}`,
				to
			});
	}, [available, openComposer, title, fragment, to]);

	return (
		<>
			<Container
				orientation="horizontal"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="fill"
				height="fit"
				padding={{ vertical: 'small' }}
			>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('event.action.yes', 'yes')}
						icon="Checkmark"
						color="success"
						onClick={accept}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('event.action.no', 'no')}
						icon="Close"
						color="error"
						onClick={decline}
					/>
				</Padding>
			</Container>
			<Divider />
		</>
	);
};

export default ProposedTimeReply;
