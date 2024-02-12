/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useState, useContext } from 'react';

import {
	SnackbarManagerContext,
	Container,
	Padding,
	Button,
	Divider,
	Row,
	Checkbox
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { useAppDispatch } from '../../../store/redux/hooks';
import { CalendarSelector } from '../../../view/editor/parts/calendar-selector';
import { sendResponse } from '../invite-reply-actions';

type InviteReplyPart = {
	inviteId: string;
	participationStatus: string;
	proposeNewTime: () => void;
	parent: string;
};
const InviteReplyPart: FC<InviteReplyPart> = ({
	inviteId,
	participationStatus,
	proposeNewTime,
	parent
}): ReactElement => {
	const [notifyOrganizer, setNotifyOrganizer] = useState(true);
	const [activeCalendar, setActiveCalendar] = useState(null);
	const createSnackbar = useContext(SnackbarManagerContext);
	const dispatch = useAppDispatch();

	const onAction = useCallback(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		(action: string): any =>
			(): void => {
				sendResponse({
					action,
					createSnackbar,
					inviteId,
					notifyOrganizer,
					activeCalendar,
					dispatch,
					parent
				});
			},
		[dispatch, inviteId, notifyOrganizer, activeCalendar, createSnackbar, parent]
	);
	return (
		<>
			<Padding top="small" />
			<Row width="fill" mainAlignment="space-between" padding={{ vertical: 'small' }}>
				<Container width="35%" mainAlignment="flex-start" crossAlignment="baseline">
					<Checkbox
						value={notifyOrganizer}
						onClick={(): void => setNotifyOrganizer(!notifyOrganizer)}
						label={t('label.notify_organizer', 'Notify Organizer')}
					/>
				</Container>
				<Container width="65%" mainAlignment="flex-start">
					<CalendarSelector
						calendarId={parent}
						onCalendarChange={(cal: any): void => setActiveCalendar(cal)}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						style={{ maxWidth: '48%', width: '48%' }}
						label={t('label.scheduled_in', 'Scheduled in')}
						excludeTrash
					/>
				</Container>
			</Row>
			<Row
				width="fill"
				height="fit"
				style={{
					flexGrow: 1,
					flexBasis: 'fit-content',
					whiteSpace: 'nowrap',
					overflow: 'hidden'
				}}
				padding={{ vertical: 'small' }}
				mainAlignment="flex-start"
			>
				<Padding right="small" vertical="large">
					<Button
						type="outlined"
						label={t('event.action.yes', 'yes')}
						icon="Checkmark"
						color="success"
						onClick={onAction('ACCEPT')}
						disabled={participationStatus === 'AC'}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('label.maybe', 'maybe')}
						icon="QuestionMark"
						color="warning"
						onClick={onAction('TENTATIVE')}
						disabled={participationStatus === 'TE'}
					/>
				</Padding>
				<Padding right="small" vertical="medium">
					<Button
						type="outlined"
						label={t('event.action.no', 'no')}
						icon="Close"
						color="error"
						onClick={onAction('DECLINE')}
						disabled={participationStatus === 'DE'}
					/>
				</Padding>
				<Padding right="small" vertical="large">
					<Button
						label={t('label.propose_new_time', 'PROPOSE NEW TIME')}
						icon="RefreshOutline"
						color="primary"
						type="outlined"
						onClick={proposeNewTime}
					/>
				</Padding>
			</Row>
			<Divider />
		</>
	);
};

export default InviteReplyPart;
