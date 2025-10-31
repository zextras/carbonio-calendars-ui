/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

const name = 'Test event';
export const eventApiData = {
	x_uid: faker.string.uuid(),
	uid: faker.string.uuid(),
	l: FOLDERS.CALENDAR,
	s: 0,
	d: 1760534450000,
	md: 1761039778,
	ms: 34575,
	rev: 34068,
	dur: 3600000,
	ptst: 'NE',
	fba: 'T',
	or: {
		a: 'test.user@test.com',
		url: 'test.user@test.com',
		d: 'Test User'
	},
	fb: 'B',
	transp: 'O',
	name,
	loc: '',
	fr: '-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::- Test User invited you to a new meeting! Subject: test ...',
	otherAtt: true,
	alarm: true,
	isOrg: false,
	id: '35097',
	invId: '35097-35096',
	compNum: 0,
	status: 'CONF',
	class: 'PUB',
	allDay: false,
	draft: false,
	neverSent: false,
	inst: [
		{
			s: 1761150600000,
			ridZ: '20251022T163000Z'
		}
	],
	alarmData: [
		{
			nextAlarm: 1761150300000,
			alarmInstStart: 1761150600000,
			invId: 35096,
			compNum: 0,
			name,
			loc: '',
			alarm: [
				{
					action: 'DISPLAY',
					trigger: [
						{
							rel: [
								{
									neg: true,
									m: 5,
									related: 'START'
								}
							]
						}
					],
					desc: [{}]
				}
			]
		}
	]
};
