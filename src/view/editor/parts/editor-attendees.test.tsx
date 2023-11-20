/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import moment from 'moment';

import { getIsBusyAtTimeOfTheEvent } from './editor-attendees';

const dateFormat = 'YYYY/MM/DD';

describe('attendees chip', () => {
	test('When an attendee is not busy at the time of the event its chip wont show a warning icon', () => {
		const attendeeId = faker.internet.email();

		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};
		const start = moment().valueOf();
		const end = moment().add(30, 'minutes').valueOf();
		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(false);
	});
	// (start > slot.s && start < slot.e)
	test('If the appointment starts while attendee is busy its chip will show a warning icon', () => {
		const attendeeId = faker.internet.email();
		const slotS = moment().subtract(15, 'minutes').valueOf();
		const slotE = moment().add(15, 'minutes').valueOf();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};
		const start = moment().valueOf();
		const end = moment().add(30, 'minutes').valueOf();
		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(true);
	});
	// (end > slot.s && end < slot.e)
	test('If the appointment ends while attendee is busy its chip will show a warning icon', () => {
		const attendeeId = faker.internet.email();
		const slotS = moment().valueOf();
		const slotE = moment().add(30, 'minutes').valueOf();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};
		const start = moment().subtract(15, 'minutes').valueOf();
		const end = moment().add(15, 'minutes').valueOf();
		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(true);
	});
	// (start < slot.s && end > slot.e)
	test('If the appointment starts before the attendee is busy but ends after the attendee is busy its chip will show a warning icon', () => {
		const attendeeId = faker.internet.email();
		const slotS = moment().valueOf();
		const slotE = moment().add(15, 'minutes').valueOf();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};
		const start = moment().subtract(15, 'minutes').valueOf();
		const end = moment().add(30, 'minutes').valueOf();
		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(true);
	});
	// start === slot.s
	test('If the appointment starts when the attendee has another appointment starting at the same time its chip will show a warning icon', () => {
		const attendeeId = faker.internet.email();
		const slotS = moment().valueOf();
		const slotE = moment().add(30, 'minutes').valueOf();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};
		const start = moment().valueOf();
		const end = moment().add(15, 'minutes').valueOf();
		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(true);
	});
	// end === slot.e
	test('If the appointment ends when the attendee has another appointment ending at the same time its chip will show a warning icon', () => {
		const attendeeId = faker.internet.email();
		const slotS = moment().valueOf();
		const slotE = moment().add(30, 'minutes').valueOf();

		const start = moment().subtract(15, 'minutes').valueOf();
		const end = moment().add(30, 'minutes').valueOf();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};

		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(true);
	});
	test('If the appointment ends on a different day from start the attendee chip wont show any warning icon', () => {
		const slotS = moment().add(5, 'minutes').valueOf();
		const slotE = moment().add(30, 'minutes').valueOf();

		const start = moment().valueOf();
		const end = moment().add(1, 'day').valueOf();
		const attendeeId = faker.internet.email();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};

		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(false);
	});
	test('If the appointment lasts all day but allDay is not checked the attendee chip will show a warning icon', () => {
		const slotS = moment().add(5, 'minutes').valueOf();
		const slotE = moment().add(30, 'minutes').valueOf();

		const start = moment().startOf('day').valueOf();
		const end = moment().add(1, 'day').startOf('day').valueOf();

		const attendeeId = faker.internet.email();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};

		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(true);
	});
	test('If the appointment is all day for 1 day and the attendee is busy its chip will show a warning icon', () => {
		const slotS = moment().add(5, 'minutes').valueOf();
		const slotE = moment().add(30, 'minutes').valueOf();

		const start = moment().valueOf();
		const end = moment().add(30, 'minutes').valueOf();

		const attendeeId = faker.internet.email();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [{ s: slotS, e: slotE }],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};

		const attendeesAvailabilityList = [item];
		const isAllDay = false;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(true);
	});
	test('If the appointment is all day for 1 day and the attendee is not busy its chip wont show a warning icon', () => {
		const start = moment().valueOf();
		const end = moment().add(30, 'minutes').valueOf();

		const attendeeId = faker.internet.email();
		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};

		const attendeesAvailabilityList = [item];
		const isAllDay = true;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(false);
	});
	test('If the appointment is all day for more than 1 day and the attendee is not busy its chip wont show a warning icon', () => {
		const start = moment().valueOf();
		const end = moment().add(2, 'days').valueOf();

		const attendeeId = faker.internet.email();

		const item = {
			id: attendeeId,
			email: attendeeId,
			b: [],
			requestedDays: [moment().format(dateFormat)],
			t: [],
			f: []
		};

		const attendeesAvailabilityList = [item];
		const isAllDay = true;
		const isBusy = getIsBusyAtTimeOfTheEvent(item, start, end, attendeesAvailabilityList, isAllDay);

		expect(isBusy).toBe(false);
	});
});
