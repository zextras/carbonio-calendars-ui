/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ButtonOld as Button, Container, Dropdown } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { generateEditor } from '../../commons/editor-generator';
import { useAppDispatch } from '../../hooks/redux';
import { useCalendarFolders } from '../../hooks/use-calendar-folders';
import { modifyAppointment } from '../../store/actions/new-modify-appointment';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';

export const ReminderPart = ({
	alarmString,
	invite,
	event
}: {
	alarmString: string;
	invite: Invite;
	event: EventType;
}): ReactElement | null => {
	const dispatch = useAppDispatch();
	const calendarFolders = useCalendarFolders();
	const setSnooze = useCallback(
		(time) => {
			const editorInvite = {
				...invite,
				alarmValue: time
			};
			const { editor } = generateEditor({
				event,
				invite: editorInvite,
				context: {
					dispatch,
					folders: calendarFolders,
					panel: true
				}
			});
			dispatch(modifyAppointment({ id: editor.id, draft: !(invite?.attendees?.length > 0) }));
		},
		[calendarFolders, dispatch, event, invite]
	);
	const getReminderItems = useMemo(
		() => [
			{
				id: '1',
				label: t('reminder.at_time_of_event', 'At the time of the event'),
				click: () => setSnooze(0)
			},
			{
				id: '2',
				label: t('reminder.minute_before', {
					count: 1,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),

				click: () => setSnooze(1)
			},
			{
				id: '3',
				label: t('reminder.minute_before', {
					count: 5,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(5)
			},
			{
				id: '4',
				label: t('reminder.minute_before', {
					count: 10,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze('10')
			},
			{
				id: '5',
				label: t('reminder.minute_before', {
					count: 15,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(15)
			},
			{
				id: '6',
				label: t('reminder.minute_before', {
					count: 30,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(30)
			},
			{
				id: '7',
				label: t('reminder.minute_before', {
					count: 45,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(45)
			},
			{
				id: '8',
				label: t('reminder.hour_before', {
					count: 1,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				click: () => setSnooze(60)
			},
			{
				id: '9',
				label: t('reminder.hour_before', {
					count: 2,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				click: () => setSnooze(120)
			},
			{
				id: '10',
				label: t('reminder.hour_before', {
					count: 4,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				click: () => setSnooze(240)
			},
			{
				id: '11',
				label: t('reminder.hour_before', {
					count: 5,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				click: () => setSnooze(300)
			},
			{
				id: '12',
				label: t('reminder.hour_before', {
					count: 18,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				click: () => setSnooze(18 * 60)
			},
			{
				id: '13',
				label: t('reminder.day_before', {
					count: 1,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				click: () => setSnooze(24 * 60)
			},
			{
				id: '14',
				label: t('reminder.day_before', {
					count: 2,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				click: () => setSnooze(48 * 60)
			},
			{
				id: '15',
				label: t('reminder.day_before', {
					count: 3,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				click: () => setSnooze(72 * 60)
			},
			{
				id: '16',
				label: t('reminder.day_before', {
					count: 4,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				click: () => setSnooze(4 * 24 * 60)
			},
			{
				id: '17',
				label: t('reminder.week_before', {
					count: 1,
					defaultValue: '{{count}} week before',
					defaultValue_plural: '{{count}} weeks before'
				}),
				click: () => setSnooze(7 * 24 * 60)
			}
		],
		[setSnooze]
	);
	return alarmString ? (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="center"
			width="fill"
			height="fit"
			padding={{ horizontal: 'large', vertical: 'small' }}
			background="gray6"
		>
			<Dropdown items={getReminderItems} placement="bottom-end">
				<Button
					label={alarmString}
					icon="ClockOutline"
					type="outlined"
					iconPlacement="left"
					onClick={noop}
				/>
			</Dropdown>
		</Container>
	) : null;
};
