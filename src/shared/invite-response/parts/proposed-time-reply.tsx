/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback } from 'react';

import { Container, Padding, Button, Divider, useSnackbar } from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { find, map } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { generateEditor } from '../../../commons/editor-generator';
import { getAppointment, normalizeFromGetAppointment } from '../../../commons/get-appointment';
import { normalizeCalendarEvent } from '../../../normalizations/normalize-calendar-events';
import { normalizeInvite } from '../../../normalizations/normalize-invite';
import { getInvite } from '../../../store/actions/get-invite';
import { modifyAppointment } from '../../../store/actions/new-modify-appointment';
import { useAppDispatch } from '../../../store/redux/hooks';
import { updateEditor } from '../../../store/slices/editor-slice';
import { ProposedTimeReplyArguments } from '../../../types/integrations';

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

	const acceptProposedTime = useCallback(() => {
		getAppointment(id).then((res) => {
			if (res?.appt[0]) {
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

				dispatch(
					getInvite({
						inviteId,
						ridZ
					})
				).then((res2) => {
					const calendar = find(calendarFolders, ['id', folderId]);
					if (calendar && res2?.payload?.m) {
						const invite = normalizeInvite(res2?.payload.m[0]);
						const appointment = normalizeFromGetAppointment(appointmentToNormalize);
						const event = normalizeCalendarEvent({ appointment, invite, calendar });
						const editor = generateEditor({
							event,
							invite,
							context: {
								attendees: map(invite.attendees, (attendee) => ({ email: attendee.a })),
								isInstance: !!ridZ,
								originalStart:
									moment(appointmentToNormalize?.inv?.[0]?.comp?.[0].s?.[0]?.d).valueOf() ?? start,
								originalEnd:
									moment(appointmentToNormalize?.inv?.[0]?.comp?.[0].e?.[0]?.d).valueOf() ?? end,
								exceptId: msg?.invite?.[0]?.comp?.[0]?.exceptId,
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
					}
				});
			}
		});
	}, [calendarFolders, createSnackbar, dispatch, end, id, moveToTrash, msg?.invite, start, t]);

	const decline = useCallback(() => {
		if (available)
			openComposer(null, {
				text: ['text', `${fragment}:`],
				subject: `${t('label.proposal_declined', 'Proposal declined')}${title}`,
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
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('event.action.decline', 'Decline')}
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
