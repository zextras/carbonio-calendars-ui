/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TFunction } from 'i18next';
import { filter } from 'lodash';
import moment from 'moment';
import { useMemo } from 'react';
import { EventType } from '../../../types/appointment-reminder';

type ReturnType = Array<{
	id: string;
	label?: string;
	click?: () => void;
	value: number;
	type?: string;
}>;
export const useGetReminderItems = (
	t: TFunction,
	setSnooze: (arg1: number, arg2?: boolean) => void,
	event: EventType
): ReturnType => {
	const diff = moment(event?.resource?.alarmData?.[0]?.alarmInstStart).diff(moment(), 'seconds');
	const beforeList = useMemo(
		() => [
			{
				id: t('reminder.at_time_of_event', 'At the time of the event'),
				label: t('reminder.at_time_of_event', 'At the time of the event'),
				click: () => setSnooze(0),
				value: 0
			},
			{
				id: t('reminder.minute_before', {
					count: 1,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				label: t('reminder.minute_before', {
					count: 1,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(1),
				value: 60
			},
			{
				id: t('reminder.minute_before', {
					count: 5,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				label: t('reminder.minute_before', {
					count: 5,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(5),
				value: 5 * 60
			},
			{
				id: t('reminder.minute_before', {
					count: 10,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				label: t('reminder.minute_before', {
					count: 10,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(10),
				value: 10 * 60
			},
			{
				id: t('reminder.minute_before', {
					count: 15,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				label: t('reminder.minute_before', {
					count: 15,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(15),
				value: 15 * 60
			},
			{
				id: t('reminder.minute_before', {
					count: 30,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				label: t('reminder.minute_before', {
					count: 30,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				}),
				click: () => setSnooze(15),
				value: 15 * 60
			},
			{
				id: t('reminder.hour_before', {
					count: 1,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				label: t('reminder.hour_before', {
					count: 1,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				}),
				click: () => setSnooze(60),
				value: 60 * 60
			},
			{
				id: 'reminder_divider',
				type: 'divider',
				value: 0
			}
		],
		[setSnooze, t]
	);

	const afterList = useMemo(
		() => [
			{
				id: 'reminder_after_1',
				label: t('reminder.minutes', {
					count: 1,
					defaultValue: '{{count}} minute ',
					defaultValue_plural: '{{count}} minutes'
				}),
				click: () => setSnooze(1, false),
				value: 1 * 60
			},
			{
				id: 'reminder_after_5',
				label: t('reminder.minutes', {
					count: 5,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes'
				}),
				click: () => setSnooze(5, false),
				value: 5 * 60
			},
			{
				id: 'reminder_after_10',
				label: t('reminder.minutes', {
					count: 10,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes'
				}),
				click: () => setSnooze(10, false),
				value: 10 * 60
			},
			{
				id: 'reminder_after_15',
				label: t('reminder.minutes', {
					count: 15,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes'
				}),
				click: () => setSnooze(15, false),
				value: 15 * 60
			},
			{
				id: 'reminder_after_30',
				label: t('reminder.minutes', {
					count: 30,
					defaultValue: '{{count}} minute',
					defaultValue_plural: '{{count}} minutes '
				}),
				click: () => setSnooze(15, false),
				value: 30 * 60
			},
			{
				id: 'reminder_after_60',
				label: t('reminder.hours', {
					count: 1,
					defaultValue: '{{count}} hour',
					defaultValue_plural: '{{count}} hours'
				}),
				click: () => setSnooze(60, false),
				value: 60 * 60
			}
		],
		[setSnooze, t]
	);

	const reminderList = useMemo(
		() => [...filter(beforeList, (item) => item.value <= diff), ...afterList],
		[afterList, beforeList, diff]
	);
	return reminderList;
};
