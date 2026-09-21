/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useRef, useState } from 'react';

import {
	Container,
	Padding,
	Button,
	Divider,
	Icon,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useFoldersMap, useHistoryNavigation } from '@zextras/carbonio-ui-commons';
import { find, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { generateEditor } from '../../../commons/editor-generator';
import { getAppointment, normalizeFromGetAppointment } from '../../../commons/get-appointment';
import { normalizeCalendarEvent } from '../../../normalizations/normalize-calendar-events';
import { normalizeInvite } from '../../../normalizations/normalize-invite';
import { declineCounterAppointmentRequest } from '../../../soap/decline-counter-appointment-request';
import { getInvite } from '../../../store/actions/get-invite';
import { modifyAppointment } from '../../../store/actions/new-modify-appointment';
import { useAppDispatch } from '../../../store/redux/hooks';
import { updateEditor } from '../../../store/slices/editor-slice';
import {
	getProposalKey,
	markProposalAsAccepted,
	markProposalAsDeclined,
	PROPOSAL_REPLY,
	useProposalReply
} from '../../../store/zustand/proposal-replies-store';
import { ProposedTimeReplyArguments } from '../../../types/integrations';
import { parseDateFromICS } from '../../../utils/dates';

type PendingAction = 'accept' | 'decline';

function resolveCompTimestamp(
	comp: { u?: number; d?: string } | undefined,
	fallback: number
): number {
	if (comp === undefined) return fallback;
	if (comp.u !== undefined) return comp.u;
	if (comp.d) return parseDateFromICS(comp.d).getTime();
	return fallback;
}

const ProposedTimeReply: FC<ProposedTimeReplyArguments> = ({
	id,
	moveToTrash,
	title,
	fragment,
	start,
	end,
	msg,
	to,
	proposalApplied = false,
	proposalDismissed = false
}): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();
	const { replaceHistory } = useHistoryNavigation();

	const counterComponent = msg?.invite?.[0]?.comp?.[0];
	const proposalKey = getProposalKey({
		messageId: msg?.id,
		ridZ: counterComponent?.ridZ,
		start,
		end
	});
	// Acceptance is kept in a store rather than in component state: the mails module re-creates
	// this panel once the counter mail is trashed, and mount-scoped state would come back reset,
	// re-enabling the button and letting the attendee receive a duplicate notification. The store
	// is gone after a reload, so the appointment itself is the fallback source of truth.
	const proposalReply = useProposalReply(proposalKey);
	const isAccepted = proposalReply === PROPOSAL_REPLY.ACCEPTED || proposalApplied;
	const isDeclined = proposalReply === PROPOSAL_REPLY.DECLINED || proposalDismissed;
	// A ref set synchronously before the first request is what stops a second click landing
	// while the chain is in flight, since a state update may not be committed yet.
	const submissionLock = useRef(false);
	const [pendingAction, setPendingAction] = useState<PendingAction | undefined>(undefined);

	const handleFailure = useCallback((): void => {
		submissionLock.current = false;
		setPendingAction(undefined);
		createSnackbar({
			key: 'proposedTimeReplyFailed',
			replace: true,
			severity: 'error',
			hideButton: true,
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000
		});
	}, [createSnackbar, t]);

	const leaveCounterMail = useCallback((): void => {
		moveToTrash?.();
		if (msg?.parent) {
			replaceHistory(`/mails/folder/${msg.parent}`);
		}
	}, [moveToTrash, msg?.parent, replaceHistory]);

	const startSubmission = useCallback((action: PendingAction): boolean => {
		if (submissionLock.current) {
			return false;
		}
		submissionLock.current = true;
		setPendingAction(action);
		return true;
	}, []);

	const applyProposedTime = useCallback(async (): Promise<void> => {
		const res = await getAppointment(id);
		if (!res?.appt?.[0]) {
			throw new Error('Appointment not found');
		}
		const inviteToNormalize =
			find(res.appt[0]?.inv, (inv) => inv?.comp?.[0]?.ridZ === counterComponent?.ridZ) ??
			res.appt[0]?.inv[0];
		const inviteId = `${inviteToNormalize.comp[0].apptId}-${inviteToNormalize.id}`;
		const ridZ = inviteToNormalize?.comp?.[0]?.ridZ ?? counterComponent?.ridZ;
		const folderId = inviteToNormalize.comp[0].ciFolder;
		const appointmentToNormalize = {
			...res?.appt[0],
			inv: [inviteToNormalize],
			inviteId
		};

		const fetchedInvite = await dispatch(getInvite({ inviteId, ridZ }));
		const calendar = find(calendarFolders, ['id', folderId]);
		if (!calendar || !fetchedInvite?.payload?.m) {
			throw new Error('Calendar or invite not available');
		}
		const invite = normalizeInvite(fetchedInvite?.payload.m[0]);
		const appointment = normalizeFromGetAppointment(appointmentToNormalize);
		const event = normalizeCalendarEvent({ appointment, invite, calendar });
		const startComp = appointmentToNormalize?.inv?.[0]?.comp?.[0].s?.[0];
		const endComp = appointmentToNormalize?.inv?.[0]?.comp?.[0].e?.[0];
		const editor = generateEditor({
			event,
			invite,
			context: {
				attendees: map(invite.attendees, (attendee) => ({ email: attendee.a })),
				isInstance: !!ridZ,
				originalStart: resolveCompTimestamp(startComp, start),
				originalEnd: resolveCompTimestamp(endComp, end),
				exceptId: counterComponent?.exceptId,
				start,
				end,
				folders: calendarFolders,
				dispatch,
				panel: false
			}
		});

		const { payload } = await dispatch(modifyAppointment({ draft: false, editor }));
		// payload is undefined when the request throws, and carries error: true on a fault
		if (!payload?.response || payload.error) {
			throw new Error('Modify appointment failed');
		}
		dispatch(updateEditor({ id: payload.editor.id, editor: payload.editor }));
		markProposalAsAccepted(proposalKey);
		createSnackbar({
			key: 'proposedTimeAccepted',
			replace: true,
			severity: 'success',
			hideButton: true,
			label: t('snackbar.proposed_time_accepted', 'You accepted the proposed time'),
			autoHideTimeout: 3000
		});
		leaveCounterMail();
	}, [
		calendarFolders,
		counterComponent,
		createSnackbar,
		dispatch,
		end,
		id,
		leaveCounterMail,
		proposalKey,
		start,
		t
	]);

	const acceptProposedTime = useCallback(() => {
		if (!startSubmission('accept')) {
			return;
		}
		applyProposedTime().catch(handleFailure);
	}, [applyProposedTime, handleFailure, startSubmission]);

	const declineProposedTime = useCallback(() => {
		if (!startSubmission('decline')) {
			return;
		}

		declineCounterAppointmentRequest({
			title: counterComponent?.name ?? title,
			fragment,
			to,
			comp: counterComponent,
			start,
			end
		})
			.then((res) => {
				if (res?.error) {
					throw new Error('Decline counter appointment failed');
				}
				markProposalAsDeclined(proposalKey);
				createSnackbar({
					key: 'proposedTimeDeclined',
					replace: true,
					severity: 'info',
					hideButton: true,
					label: t('snackbar.proposed_time_declined', 'You declined the proposed time'),
					autoHideTimeout: 3000
				});
				leaveCounterMail();
			})
			.catch(handleFailure);
	}, [
		counterComponent,
		createSnackbar,
		end,
		fragment,
		handleFailure,
		leaveCounterMail,
		proposalKey,
		start,
		startSubmission,
		t,
		title,
		to
	]);

	const replyOutcome = ((): { icon: string; color: string; label: string } | undefined => {
		if (isAccepted) {
			return {
				icon: 'CheckmarkOutline',
				color: 'success',
				label: t('label.proposed_time_accepted', 'You have accepted the proposed new time.')
			};
		}
		if (isDeclined) {
			return {
				icon: 'CloseOutline',
				color: 'error',
				label: t('label.proposed_time_declined', 'You have declined the proposed new time.')
			};
		}
		return undefined;
	})();

	return (
		<>
			{replyOutcome ? (
				<Container
					orientation="horizontal"
					crossAlignment="center"
					mainAlignment="flex-start"
					width="fill"
					height="fit"
					padding={{ vertical: 'small' }}
				>
					<Padding right="small">
						<Icon icon={replyOutcome.icon} color={replyOutcome.color} size="large" />
					</Padding>
					<Text color={replyOutcome.color} weight="bold" size="small">
						{replyOutcome.label}
					</Text>
				</Container>
			) : (
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
							label={t('event.action.accept', 'Accept')}
							icon="CheckmarkOutline"
							color="success"
							onClick={acceptProposedTime}
							disabled={pendingAction !== undefined}
							loading={pendingAction === 'accept'}
						/>
					</Padding>
					<Padding right="small" vertical="medium">
						<Button
							type="outlined"
							label={t('event.action.decline', 'Decline')}
							icon="Close"
							color="error"
							onClick={declineProposedTime}
							disabled={pendingAction !== undefined}
							loading={pendingAction === 'decline'}
						/>
					</Padding>
				</Container>
			)}
			<Divider />
		</>
	);
};

export default ProposedTimeReply;
