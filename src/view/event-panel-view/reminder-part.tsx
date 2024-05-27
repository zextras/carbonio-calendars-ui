/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Container, Button, Dropdown } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';

import { useFoldersMap } from '../../carbonio-ui-commons/store/zustand/folder';
import { generateEditor } from '../../commons/editor-generator';
import { modifyAppointment } from '../../store/actions/new-modify-appointment';
import { useAppDispatch } from '../../store/redux/hooks';
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
	const calendarFolders = useFoldersMap();
	const setSnooze = useCallback(
		(time) => {
			const editorInvite = {
				...invite,
				alarmValue: time
			};
			const editor = generateEditor({
				event,
				invite: editorInvite,
				context: {
					organizer: event.resource.organizer,
					sender: event.resource.organizer,
					dispatch,
					folders: calendarFolders,
					panel: true
				}
			});
			dispatch(modifyAppointment({ editor, draft: !(invite?.attendees?.length > 0) }));
		},
		[calendarFolders, dispatch, event, invite]
	);
	const getReminderItems = useMemo(
		() => [
			{ id: '0', label: t('reminder.never', 'Never'), value: '-1', onClick: () => setSnooze('-1') },
			{
				id: '1',
				label: t('reminder.at_time_of_event', 'At the time of the event'),
				onClick: () => setSnooze('0')
			},
			{
				id: '2',
				label: t('reminder.minute_before', {
					count: 1,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),

				onClick: () => setSnooze('1')
			},
			{
				id: '3',
				label: t('reminder.minute_before', {
					count: 5,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				onClick: () => setSnooze('5')
			},
			{
				id: '4',
				label: t('reminder.minute_before', {
					count: 10,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				onClick: () => setSnooze('10')
			},
			{
				id: '5',
				label: t('reminder.minute_before', {
					count: 15,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				onClick: () => setSnooze('15')
			},
			{
				id: '6',
				label: t('reminder.minute_before', {
					count: 30,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				onClick: () => setSnooze('30')
			},
			{
				id: '7',
				label: t('reminder.minute_before', {
					count: 45,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				onClick: () => setSnooze('45')
			},
			{
				id: '8',
				label: t('reminder.hour_before', {
					count: 1,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				onClick: () => setSnooze('60')
			},
			{
				id: '9',
				label: t('reminder.hour_before', {
					count: 2,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				onClick: () => setSnooze('120')
			},
			{
				id: '10',
				label: t('reminder.hour_before', {
					count: 4,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				onClick: () => setSnooze('240')
			},
			{
				id: '11',
				label: t('reminder.hour_before', {
					count: 5,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				onClick: () => setSnooze('300')
			},
			{
				id: '12',
				label: t('reminder.hour_before', {
					count: 18,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				onClick: () => setSnooze((18 * 60).toString())
			},
			{
				id: '13',
				label: t('reminder.day_before', {
					count: 1,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				onClick: () => setSnooze((24 * 60).toString())
			},
			{
				id: '14',
				label: t('reminder.day_before', {
					count: 2,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				onClick: () => setSnooze((48 * 60).toString())
			},
			{
				id: '15',
				label: t('reminder.day_before', {
					count: 3,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				onClick: () => setSnooze((72 * 60).toString())
			},
			{
				id: '16',
				label: t('reminder.day_before', {
					count: 4,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				}),
				onClick: () => setSnooze((4 * 24 * 60).toString())
			},
			{
				id: '17',
				label: t('reminder.week_before', {
					count: 1,
					defaultValue: '{{count}} week before',
					defaultValue_plural: '{{count}} weeks before'
				}),
				onClick: () => setSnooze((7 * 24 * 60).toString())
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
			background={'gray6'}
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
