/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/extensions */
import React, { FC, ReactElement, useCallback, useState, useContext } from 'react';
import {
	SnackbarManagerContext,
	Container,
	Padding,
	Button,
	Divider,
	Row,
	Checkbox
} from '@zextras/zapp-ui';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { sendResponse } from '../inivte-reply-actions';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CalendarSelector from '../../../view/event-panel-edit/components/calendar-selector';

type InviteReplyPart = {
	inviteId: string;
	invite: any;
	participationStatus: string;
	compNum: string;
};
const InviteReplyPart: FC<InviteReplyPart> = ({
	inviteId,
	participationStatus,
	compNum
}): ReactElement => {
	const [notifyOrganizer, setNotifyOrganizer] = useState(true);
	const [activeCalendar, setActiveCalendar] = useState(null);
	const createSnackbar = useContext(SnackbarManagerContext);
	const [t] = useTranslation();
	const dispatch = useDispatch();

	const onAction = useCallback(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		(action: string): any =>
			(): void => {
				sendResponse({
					action,
					createSnackbar,
					t,
					inviteId,
					compNum,
					notifyOrganizer,
					activeCalendar,
					dispatch
				});
			},
		[dispatch, inviteId, compNum, notifyOrganizer, activeCalendar, t, createSnackbar]
	);
	return (
		<>
			<Padding top="small" />
			<Divider />
			<Row
				width="fill"
				mainAlignment="space-between"
				padding={{ horizontal: 'small', vertical: 'small' }}
			>
				<Container width="50%" mainAlignment="flex-start" crossAlignment="baseline">
					<Checkbox
						value={notifyOrganizer}
						onClick={(): void => setNotifyOrganizer(!notifyOrganizer)}
						label="Notify Organizer"
					/>
				</Container>
				<Container width="50%" mainAlignment="flex-start">
					<CalendarSelector
						calendarId="10"
						onCalendarChange={(cal: any): void => setActiveCalendar(cal)}
						style={{ maxWidth: '48%', width: '48%' }}
						label={t('label.select_in')}
						excludeTrash
					/>
				</Container>
			</Row>
			<Divider />
			<Container
				orientation="horizontal"
				crossAlignment="flex-start"
				mainAlignment="center"
				weight="fill"
				height="fit"
				padding={{ top: 'medium' }}
			>
				<Button
					type="outlined"
					label="YES"
					icon="Checkmark"
					color="success"
					onClick={onAction('ACCEPT')}
					disabled={participationStatus === 'AC'}
				/>
				<Padding horizontal="small" />
				<Button
					type="outlined"
					label="MAYBE"
					icon="QuestionMark"
					color="warning"
					onClick={onAction('TENTATIVE')}
					disabled={participationStatus === 'TE'}
				/>
				<Padding horizontal="small" />
				<Button
					type="outlined"
					label="NO"
					icon="Close"
					color="error"
					onClick={onAction('DECLINE')}
					disabled={participationStatus === 'DE'}
				/>
			</Container>
		</>
	);
};

export default InviteReplyPart;
