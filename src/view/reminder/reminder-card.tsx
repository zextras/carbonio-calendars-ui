/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { FC, ReactElement, useCallback, useState, useMemo, useEffect } from 'react';

import {
	Text,
	Row,
	Icon,
	IconButton,
	Tooltip,
	Padding,
	Dropdown,
	Container
} from '@zextras/zapp-ui';
import moment from 'moment';
import { dismissApptReminder } from '../../store/actions/dismiss-appointment-reminder';
import { snoozeApptReminder } from '../../store/actions/snooze-appointment-reminder';
import { ApptReminderCardProps } from '../../types/appointment-reminder';
import { getReminderItems } from './commons/reminder-time-options';

const ApptReminderCard: FC<ApptReminderCardProps> = ({
	event,
	t,
	dispatch,
	toggleModal,
	removeReminder,
	setActive
}): ReactElement => {
	const [now, setNow] = useState(moment().valueOf());

	useEffect(() => {
		const interval = setInterval(() => setNow(moment().valueOf()), 30000);
		return () => clearInterval(interval);
	}, []);

	const dismissReminder = useCallback(() => {
		dispatch(
			// @ts-ignore
			dismissApptReminder({
				dismissItems: [{ id: event.resource.id, dismissedAt: moment().valueOf() }]
			})
		);
		removeReminder(event.resource.id);
		// .then((res: any) => removeReminder(event.resource.id));
	}, [dispatch, event.resource.id, removeReminder]);

	const snoozeReminder = useCallback(
		(time) => {
			dispatch(
				// @ts-ignore
				snoozeApptReminder({
					id: event.resource.id,
					until: moment(event.start).subtract(time, 'minutes').valueOf()
				})
			);
			removeReminder(event.resource.id);
		},
		[dispatch, event.resource.id, event.start, removeReminder]
	);
	const reminderItems = useMemo(() => getReminderItems(t, snoozeReminder), [t, snoozeReminder]);

	const timeToDisplay = useMemo(() => {
		const difference = moment(event.end).diff(moment(event.start), 'seconds');
		if (event.start < now && event.end > now) {
			return (
				<Text color="info" size="large">
					{t('label.ongoing', 'Ongoing')}
				</Text>
			);
		}
		if (event.start === now) {
			return (
				<Text color="info" size="large">
					{t('label.now', 'Now')}
				</Text>
			);
		}
		if (event.start < now) {
			return (
				<Text color="error" size="large">
					{moment(event.start).from(moment())}
				</Text>
			);
		}
		if (
			event.resource.alarmData[0].alarmInstStart < now &&
			moment(event.resource.alarmData[0].alarmInstStart).add(difference, 'seconds').valueOf() > now
		) {
			return (
				<Text color="info" size="large">
					{t('label.ongoing', 'Ongoing')}
				</Text>
			);
		}
		if (event.resource.alarmData[0].alarmInstStart < now) {
			return (
				<Text color="error" size="large">
					{moment(event.resource.alarmData[0].alarmInstStart).fromNow()}
				</Text>
			);
		}

		return (
			<Text color="info" size="large">
				{moment(event.resource.alarmData[0].alarmInstStart).fromNow()}
			</Text>
		);
	}, [now, event, t]);

	return (
		<>
			<Container
				padding={{ vertical: 'small' }}
				mainAlignment="space-between"
				takeAvailableSpace
				crossAlignment="center"
				orientation="horizontal"
			>
				<Row
					mainAlignment="space-evenly"
					crossAlignment="center"
					orientation="horizontal"
					width="65%"
				>
					<Row width="20%" mainAlignment="flex-start">
						<Icon icon="PhoneCallOutline" size="large" />
					</Row>
					<Row width="80%" mainAlignment="center" crossAlignment="baseline" orientation="vertical">
						<Row>
							<Text size="large">{event.title}</Text>
						</Row>
						{event.resource.locationUrl && (
							<Row>
								<Text>
									<a target="_blank" href={event.resource.locationUrl} rel="noreferrer">
										{event.resource.locationUrl}
									</a>
								</Text>
							</Row>
						)}

						<Row padding={{ top: 'extrasmall' }}>
							<Text size="large">
								{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
							</Text>
							<Padding left="small">{timeToDisplay}</Padding>
						</Row>
					</Row>
				</Row>
				<Row
					width="35%"
					mainAlignment="flex-end"
					crossAlignment="center"
					orientation="horizontal"
					padding={{ horizontal: 'large' }}
				>
					<Row>
						{(moment(event.start).valueOf() < moment().valueOf() ||
							moment(event.resource.alarmData[0].alarmInstStart).valueOf() < moment().valueOf()) &&
						event.resource.iAmOrganizer ? (
							<Tooltip placement="top" label={t('label.set_new_time', 'Set new time')}>
								<IconButton
									icon="ClockOutline"
									size="large"
									onClick={() => {
										setActive(event);
										toggleModal();
									}}
								/>
							</Tooltip>
						) : (
							<Tooltip placement="top" label={t('label.snooze', 'Snooze')}>
								<Dropdown items={reminderItems} placement="bottom-end">
									<IconButton icon="Flip2Outline" size="large" />
								</Dropdown>
							</Tooltip>
						)}

						<Tooltip placement="top" label={t('label.dismiss', 'Dismiss').toUpperCase()}>
							<IconButton icon="BellOffOutline" size="large" onClick={dismissReminder} />
						</Tooltip>
					</Row>
				</Row>
			</Container>
		</>
	);
};

export default ApptReminderCard;
