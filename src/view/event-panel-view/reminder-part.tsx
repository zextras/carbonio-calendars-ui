/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Container, Button, Dropdown } from '@zextras/carbonio-design-system';
import { useFoldersMap } from '@zextras/carbonio-ui-commons';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

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
		(count: number) =>
			t('reminder.minute_before', {
				count,
				defaultValue_one: '{{count}} minute before',
				defaultValue_other: '{{count}} minutes before'
			}),
		[t]
	);

	const getHourLabel = useCallback(
		(count: number) =>
			t('reminder.hour_before', {
				count,
				defaultValue_one: '{{count}} hour before',
				defaultValue_other: '{{count}} hours before'
			}),
		[t]
	);

	const getDayLabel = useCallback(
		(count: number) =>
			t('reminder.day_before', {
				count,
				defaultValue_one: '{{count}} day before',
				defaultValue_other: '{{count}} days before'
			}),
		[t]
	);

	// Handler to update snooze alarm value
	const updateSnooze = useCallback(
		(alarmValue: string) => {
			const updatedInvite = { ...invite, alarmValue };
			const editor = generateEditor({
				event,
				invite: updatedInvite,
				context: {
					organizer: {
						email: event.resource.organizer?.email ?? '',
						fullName: event.resource.organizer?.name ?? ''
					},
					sender: {
						email: event.resource.organizer?.email ?? '',
						fullName: event.resource.organizer?.name ?? ''
					},
					dispatch,
					folders: calendarFolders,
					panel: true
				}
			});
			dispatch(modifyAppointment({ editor, draft: invite?.attendees?.length <= 0 }));
		},
		[calendarFolders, dispatch, event, invite]
	);

	const reminderOptions = useMemo(() => {
		const toMinutes = (units: number, unitType: 'minutes' | 'hours' | 'days'): string => {
			switch (unitType) {
				case 'minutes':
					return units.toString();
				case 'hours':
					return (units * 60).toString();
				case 'days':
					return (units * 24 * 60).toString();
				default:
					return '0';
			}
		};

		return [
			{
				id: '0',
				label: t('reminder.never', 'Never'),
				selected: invite.alarmValue === '0',
				onClick: () => updateSnooze('0')
			},
			{
				id: '1',
				label: t('reminder.at_time_of_event', 'At the time of the event'),
				selected: invite.alarmValue === '-1',
				onClick: () => updateSnooze('-1')
			},
			// Minutes
			...[1, 5, 10, 15, 30, 45].map((count) => ({
				id: `min-${count}`,
				label: getMinuteLabel(count),
				selected: invite.alarmValue === count.toString(),
				onClick: () => updateSnooze(count.toString())
			})),
			// Hours
			...[1, 2, 4, 5, 18].map((count) => ({
				id: `hr-${count}`,
				label: getHourLabel(count),
				selected: invite.alarmValue === toMinutes(count, 'hours'),
				onClick: () => updateSnooze(toMinutes(count, 'hours'))
			})),
			// Days
			...[1, 2, 3, 4].map((count) => ({
				id: `day-${count}`,
				label: getDayLabel(count),
				selected: invite.alarmValue === toMinutes(count, 'days'),
				onClick: () => updateSnooze(toMinutes(count, 'days'))
			})),
			// Week
			{
				id: 'week-1',
				label: t('reminder.week_before', {
					count: 1,
					defaultValue_one: '{{count}} week before',
					defaultValue_other: '{{count}} weeks before'
				}),
				selected: invite.alarmValue === toMinutes(7, 'days'),
				onClick: () => updateSnooze(toMinutes(7, 'days'))
			}
		];
	}, [getDayLabel, getHourLabel, getMinuteLabel, invite.alarmValue, t, updateSnooze]);

	if (!alarmString) return null;

	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="center"
			width="fill"
			height="fit"
			padding={{ horizontal: 'large', vertical: 'small' }}
			background={'gray6'}
		>
			<Dropdown items={reminderOptions} placement="bottom-end">
				<Button
					label={alarmString}
					icon="ClockOutline"
					type="outlined"
					iconPlacement="left"
					onClick={noop}
				/>
			</Dropdown>
		</Container>
	);
};
