/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { TFunction } from 'i18next';

export const getReminderItems = (t: TFunction, setSnooze: (arg: number) => void) => [
	{
		id: t('reminder.at_time_of_event', 'At time of the event'),
		label: t('reminder.at_time_of_event', 'At time of the event'),
		click: () => setSnooze(0)
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
		click: () => setSnooze(1)
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
		click: () => setSnooze(5)
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
		click: () => setSnooze(10)
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
		click: () => setSnooze(15)
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
		click: () => setSnooze(60)
	}
];
