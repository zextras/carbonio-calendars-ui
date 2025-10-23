/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { ReminderItem } from '../../../types/appointment-reminder';
import { AlarmType } from '../../../types/event';

export const generateAlarmData = (model: Partial<AlarmType> = {}): AlarmType => ({
	nextAlarm: model.nextAlarm ?? new Date().getTime(),
	alarmInstStart: model.alarmInstStart ?? new Date().getTime(),
	invId: model.invId ?? faker.number.int(),
	compNum: 0,
	name: '',
	loc: '',
	alarm: [
		{
			action: 'DISPLAY',
			trigger: [
				{
					rel: [
						{
							neg: 'true',
							m:
								model.alarm?.[0]?.trigger?.[0].rel?.[0]?.m ?? faker.number.int({ min: 1, max: 60 }),
							related: 'START'
						}
					]
				}
			],
			desc: {
				description: ''
			}
		}
	]
});

export const generateReminderItem = (model: Partial<ReminderItem> = {}): ReminderItem => {
	const now = new Date();
	const startDate = new Date(now.getTime() + 60 * 60 * 1000);
	const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);

	return {
		allDay: model.allDay ?? false,
		calendar: model.calendar ?? { id: FOLDERS.CALENDAR },
		inviteId: model.inviteId ?? `${faker.number.int()}-${faker.number.int()}`,
		isException: model.isException ?? false,
		id: model.id ?? faker.number.int().toString(),
		name: model.name ?? faker.lorem.word(),
		start: model.start ?? startDate,
		end: model.end ?? endDate,
		location: model.location ?? faker.lorem.word(),
		alarmData: model.alarmData
			? [{ ...generateAlarmData(), ...model.alarmData }]
			: [generateAlarmData()],
		isOrg: model.isOrg ?? faker.datatype.boolean(),
		isRecurrent: model.isRecurrent ?? faker.datatype.boolean(),
		key: model.key ?? faker.string.uuid()
	};
};
