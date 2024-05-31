/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Container, Button, Dropdown } from '@zextras/carbonio-design-system';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

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

	const [t] = useTranslation();

	const getMinuteLabel = useCallback(
		(count) =>
			t('reminder.minute_before', {
				count,
				defaultValue_one: '{{count}} minute before',
				defaultValue_other: '{{count}} minutes before'
			}),
		[t]
	);

	const getHourLabel = useCallback(
		(count) =>
			t('reminder.hour_before', {
				count,
				defaultValue_one: '{{count}} hour before',
				defaultValue_other: '{{count}} hours before'
			}),
		[t]
	);

	const getDayLabel = useCallback(
		(count) =>
			t('reminder.day_before', {
				count,
				defaultValue_one: '{{count}} day before',
				defaultValue_other: '{{count}} days before'
			}),
		[t]
	);

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
			dispatch(modifyAppointment({ editor, draft: invite?.attendees?.length <= 0 }));
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
				label: getMinuteLabel(1),
				onClick: () => setSnooze('1')
			},
			{
				id: '3',
				label: getMinuteLabel(5),
				onClick: () => setSnooze('5')
			},
			{
				id: '4',
				label: getMinuteLabel(10),
				onClick: () => setSnooze('10')
			},
			{
				id: '5',
				label: getMinuteLabel(15),
				onClick: () => setSnooze('15')
			},
			{
				id: '6',
				label: getMinuteLabel(30),
				onClick: () => setSnooze('30')
			},
			{
				id: '7',
				label: getMinuteLabel(45),
				onClick: () => setSnooze('45')
			},
			{
				id: '8',
				label: getHourLabel(1),
				onClick: () => setSnooze('60')
			},
			{
				id: '9',
				label: getHourLabel(2),
				onClick: () => setSnooze('120')
			},
			{
				id: '10',
				label: getHourLabel(4),
				onClick: () => setSnooze('240')
			},
			{
				id: '11',
				label: getHourLabel(5),
				onClick: () => setSnooze('300')
			},
			{
				id: '12',
				label: getHourLabel(18),
				onClick: () => setSnooze((18 * 60).toString())
			},
			{
				id: '13',
				label: getDayLabel(1),
				onClick: () => setSnooze((24 * 60).toString())
			},
			{
				id: '14',
				label: getDayLabel(2),
				onClick: () => setSnooze((48 * 60).toString())
			},
			{
				id: '15',
				label: getDayLabel(3),
				onClick: () => setSnooze((72 * 60).toString())
			},
			{
				id: '16',
				label: getDayLabel(4),
				onClick: () => setSnooze((4 * 24 * 60).toString())
			},
			{
				id: '17',
				label: t('reminder.week_before', {
					count: 1,
					defaultValue_one: '{{count}} week before',
					defaultValue_other: '{{count}} weeks before'
				}),
				onClick: () => setSnooze((7 * 24 * 60).toString())
			}
		],
		[getDayLabel, getHourLabel, getMinuteLabel, setSnooze, t]
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
