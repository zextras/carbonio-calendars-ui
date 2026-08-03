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
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { useFoldersMap } from '@zextras/carbonio-ui-commons';
import { find, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { generateEditor } from '../../../commons/editor-generator';
import { getAppointment, normalizeFromGetAppointment } from '../../../commons/get-appointment';
import { normalizeCalendarEvent } from '../../../normalizations/normalize-calendar-events';
import { normalizeInvite } from '../../../normalizations/normalize-invite';
import { getInvite } from '../../../store/actions/get-invite';
import { modifyAppointment } from '../../../store/actions/new-modify-appointment';
import { useAppDispatch } from '../../../store/redux/hooks';
import { updateEditor } from '../../../store/slices/editor-slice';
import {
	getProposalKey,
	markProposalAsAccepted,
	useIsProposalAccepted
} from '../../../store/zustand/accepted-proposals-store';
import { ProposedTimeReplyArguments } from '../../../types/integrations';
import { parseDateFromICS } from '../../../utils/dates';

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
	to
}): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const dispatch = useAppDispatch();
	const calendarFolders = useFoldersMap();
	const [openComposer, available] = useIntegratedFunction('compose');

	const proposalKey = getProposalKey({
		messageId: msg?.id,
		ridZ: msg?.invite?.[0]?.comp?.[0]?.ridZ,
		start,
		end
	});
	// Acceptance is kept in a store rather than in component state: the mails module re-creates
	// this panel once the counter mail is trashed, and mount-scoped state would come back reset,
	// re-enabling the button and letting the attendee receive a duplicate notification.
	const isAccepted = useIsProposalAccepted(proposalKey);
	// A ref set synchronously before the first request is what stops a second click landing
	// while the chain is in flight, since a state update may not be committed yet.
	const submissionLock = useRef(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const acceptProposedTime = useCallback(() => {
		if (submissionLock.current) {
			return;
		}
		submissionLock.current = true;
		setIsSubmitting(true);

		const handleFailure = (): void => {
			submissionLock.current = false;
			setIsSubmitting(false);
			createSnackbar({
				key: 'proposedTimeAcceptFailed',
				replace: true,
				severity: 'error',
				hideButton: true,
				label: t('label.error_try_again', 'Something went wrong, please try again'),
				autoHideTimeout: 3000
			});
		};

		getAppointment(id)
			.then((res) => {
				if (!res?.appt?.[0]) {
					throw new Error('Appointment not found');
				}
				const inviteToNormalize =
					find(
						res.appt[0]?.inv,
						(inv) => inv?.comp?.[0]?.ridZ === msg?.invite?.[0]?.comp?.[0]?.ridZ
					) ?? res.appt[0]?.inv[0];
				const inviteId = `${inviteToNormalize.comp[0].apptId}-${inviteToNormalize.id}`;
				const ridZ = inviteToNormalize?.comp?.[0]?.ridZ ?? msg?.invite?.[0]?.comp?.[0]?.ridZ;
				const folderId = inviteToNormalize.comp[0].ciFolder;
				const appointmentToNormalize = {
					...res?.appt[0],
					inv: [inviteToNormalize],
					inviteId
				};

				return dispatch(
					getInvite({
						inviteId,
						ridZ
					})
				).then((res2) => {
					const calendar = find(calendarFolders, ['id', folderId]);
					if (!calendar || !res2?.payload?.m) {
						throw new Error('Calendar or invite not available');
					}
					const invite = normalizeInvite(res2?.payload.m[0]);
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
							exceptId: msg?.invite?.[0]?.comp?.[0]?.exceptId,
							start,
							end,
							folders: calendarFolders,
							dispatch,
							panel: false
						}
					});

					return dispatch(modifyAppointment({ draft: false, editor })).then(({ payload }) => {
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
						moveToTrash?.();
					});
				});
			})
			.catch(handleFailure);
	}, [
		calendarFolders,
		createSnackbar,
		dispatch,
		end,
		id,
		moveToTrash,
		msg?.invite,
		proposalKey,
		start,
		t
	]);

	const declineProposedTime = useCallback(() => {
		if (available)
			openComposer(null, {
				text: ['text', `${fragment}:`],
				subject: `${t('label.proposal_declined', 'Proposal declined')}: ${title}`,
				to
			});
	}, [available, openComposer, fragment, t, title, to]);

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
						label={t('event.action.accept', 'Accept')}
						icon="CheckmarkOutline"
						color="success"
						onClick={acceptProposedTime}
						disabled={isAccepted || isSubmitting}
						loading={isSubmitting}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('event.action.decline', 'Decline')}
						icon="Close"
						color="error"
						onClick={declineProposedTime}
						disabled={isAccepted || isSubmitting}
					/>
				</Padding>
			</Container>
			{isAccepted && (
				<Container
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="fill"
					height="fit"
					padding={{ bottom: 'small' }}
				>
					<Text color="secondary" size="small">
						{t('label.proposed_time_accepted', 'You accepted the proposed time')}
					</Text>
				</Container>
			)}
			<Divider />
		</>
	);
};

export default ProposedTimeReply;
