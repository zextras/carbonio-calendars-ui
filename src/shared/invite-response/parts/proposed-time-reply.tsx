/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useContext } from 'react';
import {
	SnackbarManagerContext,
	Container,
	Padding,
	ButtonOld as Button,
	Divider
} from '@zextras/carbonio-design-system';
import { t, useIntegratedFunction, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { normalizeInvite } from '../../../normalizations/normalize-invite';
import { appointmentToEvent } from '../../../hooks/use-invite-to-event';
import { getAppointmentAndInvite } from '../../../commons/get-appointment';
import { modifyAppointmentRequest } from '../../../store/actions/modify-appointment';
import { normalizeAppointmentFromCreation } from '../../../normalizations/normalize-appointments';
import { useAppDispatch } from '../../../store/redux/hooks';
import { Invite } from '../../../types/store/invite';

type ProposedTimeReply = {
	invite: Invite;
	id: string;
	inviteId: string;
	moveToTrash: () => void;
	title: string;
	fragment: string;
	to: { address: string; fullName: string; name: string; type: string };
};
const ProposedTimeReply: FC<ProposedTimeReply> = ({
	id,
	inviteId,
	invite,
	moveToTrash,
	title,
	fragment,
	to
}): ReactElement => {
	const createSnackbar = useContext(SnackbarManagerContext);
	const dispatch = useAppDispatch();
	const accounts = useUserAccounts();
	const [openComposer, available] = useIntegratedFunction('compose');
	const accept = useCallback(() => {
		getAppointmentAndInvite({ aptId: id, inviteId }).then((res) => {
			const { appointment, invite: _invite } = res;
			const normalizedAppointment = normalizeAppointmentFromCreation(appointment, {});
			const normalizedInvite = _invite.inv[0].comp
				? normalizeInvite(_invite)
				: normalizeInvite({ ..._invite, inv: appointment.inv });
			const requiredEvent = appointmentToEvent(normalizedInvite, normalizedAppointment.id);

			dispatch(
				modifyAppointmentRequest({
					appt: requiredEvent,
					invite: normalizedInvite,
					mailInvite: invite,
					account: accounts[0]
				})
			).then((result) => {
				if (result.type.includes('fulfilled')) {
					createSnackbar({
						key: 'proposedTimeAccepted',
						replace: true,
						type: 'success',
						hideButton: true,
						label: t('snackbar.proposed_time_accepted', 'You accepted the proposed time'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: 'proposedTimeAccepted',
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
				moveToTrash();
			});
		});
	}, [dispatch, id, inviteId, invite, accounts, moveToTrash, createSnackbar]);
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
