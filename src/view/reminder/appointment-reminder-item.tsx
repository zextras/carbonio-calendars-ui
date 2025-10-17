/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Collapse,
	Button,
	Container,
	Dropdown,
	Icon,
	Link,
	Padding,
	Row,
	Text,
	Tooltip,
	TextProps
} from '@zextras/carbonio-design-system';
import { noop } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { AppointmentReminderItemDetails } from './appointment-reminder-item-details';
import { useGetReminderItems } from './reminder-time-options';
import { getTimeToDisplayData } from '../../commons/utilities';
import { dismissApptReminder } from '../../store/actions/dismiss-appointment-reminder';
import { snoozeApptReminder } from '../../store/actions/snooze-appointment-reminder';
import { useAppDispatch } from '../../store/redux/hooks';
import { ApptReminderCardProps } from '../../types/appointment-reminder';

const DEFAULT_FONT_SIZE = 'medium';
const TITLE_FONT_SIZE = 'large';
const TITLE_FONT_WEIGHT: TextProps['weight'] = 'medium';

// TODO reduce the fields in the reminderItem field, because this component will read the needed fields on demand
export const AppointmentReminderItem: FC<ApptReminderCardProps> = ({
	reminderItem,
	toggleModal,
	removeReminder,
	setActiveReminder
}): ReactElement => {
	const {
		start,
		id,
		isRecurrent,
		end,
		alarmData,
		name: title,
		isOrg: isOrganizer,
		key
	} = reminderItem;
	const dispatch = useAppDispatch();
	const [t] = useTranslation();
	const [now, setNow] = useState(moment().valueOf());
	const [isDetailsExpanded, setDetailsExpanded] = useState(false);

	const rescheduleLabel = t('label.reschedule_appointment', 'Reschedule appointment');
	const snoozeLabel = t('label.snooze', 'Snooze');
	const dismissLabel = t('label.dismiss', 'Dismiss');
	const labelShowEventDetails = useMemo(
		() =>
			isDetailsExpanded
				? t('label.hide_event_details', 'Hide details')
				: t('label.show_event_details', 'Show details'),
		[isDetailsExpanded, t]
	);

	const isSetNewTimeAllowed = useMemo(
		() =>
			(moment(start).valueOf() < moment().valueOf() ||
				moment(alarmData[0].alarmInstStart).valueOf() < moment().valueOf()) &&
			isOrganizer,
		[alarmData, isOrganizer, start]
	);

	const dismissReminder = useCallback(() => {
		dispatch(
			dismissApptReminder({
				dismissItems: [{ id, dismissedAt: new Date().getTime() }]
			})
		);
		removeReminder(key);
	}, [dispatch, id, key, removeReminder]);

	const toggleDetailsExpanded = useCallback(() => setDetailsExpanded((expanded) => !expanded), []);

	const setNewTime = useCallback(() => {
		setActiveReminder(reminderItem);
		toggleModal();
	}, [reminderItem, setActiveReminder, toggleModal]);

	const snoozeReminder = useCallback(
		(time: number, isBefore = true) => {
			const untilForBefore = isRecurrent
				? moment()
						.set({
							hour: moment(start).hour(),
							minute: moment(start).minute()
						})
						.subtract(time, 'minutes')
						.valueOf()
				: moment(start).subtract(time, 'minutes').valueOf();
			dispatch(
				snoozeApptReminder({
					id,
					until: isBefore ? untilForBefore : moment().add(time, 'minutes').valueOf()
				})
			);
			removeReminder(key);
		},
		[isRecurrent, start, dispatch, id, removeReminder, key]
	);

	const reminderItems = useGetReminderItems(snoozeReminder, alarmData);

	const timeToDisplay = useMemo(() => {
		const { color, text } = getTimeToDisplayData(reminderItem, now);
		return (
			<Text color={color} size={DEFAULT_FONT_SIZE}>
				{text}
			</Text>
		);
	}, [now, reminderItem]);

	useEffect(() => {
		const interval = setInterval(() => setNow(moment().valueOf()), 30000);
		return () => clearInterval(interval);
	}, []);

	return (
		<Container orientation="vertical" crossAlignment="flex-start">
			<Row width={'fill'}>
				<Icon icon="PhoneCallOutline" size="large" />
				<Padding left="large"></Padding>
				<Row takeAvailableSpace mainAlignment={'flex-start'}>
					<Text weight={TITLE_FONT_WEIGHT} size={TITLE_FONT_SIZE}>
						{title}
					</Text>
				</Row>
				<Row mainAlignment="flex-end" width="fit">
					{isSetNewTimeAllowed ? (
						<Tooltip placement="top" label={rescheduleLabel}>
							<Button
								icon="CalendarOutline"
								type="ghost"
								color="text"
								size="large"
								onClick={setNewTime}
							/>
						</Tooltip>
					) : (
						<Tooltip placement="top" label={snoozeLabel}>
							<Dropdown items={reminderItems} placement="bottom-end">
								<Button type="ghost" color="text" icon="ClockOutline" size="large" onClick={noop} />
							</Dropdown>
						</Tooltip>
					)}
					<Tooltip placement="top" label={dismissLabel}>
						<Button
							type="ghost"
							color="text"
							icon="BellOffOutline"
							size="large"
							onClick={dismissReminder}
						/>
					</Tooltip>
				</Row>
			</Row>

			<Row width="fill" padding={{ left: '2.5rem', bottom: 'small' }} mainAlignment="space-between">
				<Row mainAlignment="flex-start">
					<Text size={DEFAULT_FONT_SIZE}>
						{moment(start).format('HH:mm')} - {moment(end).format('HH:mm')}
					</Text>
					<Padding left="small">{timeToDisplay}</Padding>
				</Row>

				<Row>
					<Link color="info" underlined onClick={toggleDetailsExpanded} size={DEFAULT_FONT_SIZE}>
						{labelShowEventDetails}
					</Link>
				</Row>
			</Row>

			<Collapse orientation="vertical" open={isDetailsExpanded} crossSize={'100%'}>
				<Row width="fill">
					<Row
						width="fill"
						padding={{ left: '2.5rem' }}
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<AppointmentReminderItemDetails
							reminderItem={reminderItem}
							fontSize={DEFAULT_FONT_SIZE}
						/>
					</Row>
				</Row>
			</Collapse>
		</Container>
	);
};
