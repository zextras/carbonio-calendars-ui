/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { map } from 'lodash';
import moment from 'moment';

import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_RESOURCES } from '../../../constants';
import { reducers } from '../../../store/redux';

const dateFormat = 'YYYY/MM/DD';

describe('editor availability warning row', () => {
	describe('getIsBusyAtTimeOfTheEvent', () => {
		test('When an attendee is not busy at the time of the event the function return false', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(false);
		});
		// (start > slot.s && start < slot.e)
		test('If the appointment starts while attendee is busy the function return true', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(true);
		});
		// (end > slot.s && end < slot.e)
		test('If the appointment ends while attendee is busy the function return true', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(true);
		});
		// (start < slot.s && end > slot.e)
		test('If the appointment starts before the attendee is busy but ends after the attendee is busy the function return true', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(true);
		});
		// start === slot.s
		test('If the appointment starts when the attendee has another appointment starting at the same time the function return true', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(true);
		});
		// end === slot.e
		test('If the appointment ends when the attendee has another appointment ending at the same time the function return true', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(true);
		});
		test('If the appointment ends on a different day from start the function return false', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(false);
		});
		test('If the appointment lasts all day but allDay is not checked the function return true', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(true);
		});
		test('If the appointment is all day for 1 day and the attendee is busy the function return true', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(true);
		});
		test('If the appointment is all day for 1 day and the attendee is not busy the function return false', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(false);
		});
		test('If the appointment is all day for more than 1 day and the attendee is not busy the function return false', () => {
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
			const isBusy = getIsBusyAtTimeOfTheEvent(
				item,
				start,
				end,
				attendeesAvailabilityList,
				isAllDay
			);

			expect(isBusy).toBe(false);
		});
	});
	describe('EditorAvailabilityWarningRow', () => {
		test('If a room is busy at the time of the event, there will be a warning string to inform the user', async () => {
			const busyStart = moment().add(5, 'hours').valueOf();
			const busyEnd = moment().add(5, 'hours').add(30, 'minutes').valueOf();

			const roomId = faker.string.uuid();
			const roomEmail = faker.internet.email();

			const editorMeetingRoomItem = {
				id: roomId,
				label: faker.lorem.word(),
				value: faker.lorem.word(),
				email: roomEmail,
				type: CALENDAR_RESOURCES.ROOM
			};

			const itemInList = {
				id: roomId,
				email: roomEmail,
				b: [
					{
						s: busyStart,
						e: busyEnd
					}
				],
				requestedDays: [moment().format(dateFormat)],
				t: [],
				f: [
					{
						s: moment().startOf('day').valueOf(),
						e: moment().add(5, 'hours').valueOf()
					},
					{
						s: moment().add(5, 'hours').add(30, 'minutes').valueOf(),
						e: moment().endOf('day').valueOf()
					}
				]
			};

			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					start: busyStart,
					end: busyEnd,
					meetingRoom: [editorMeetingRoomItem]
				}
			});

			const items = map({ length: 4 }, () => ({
				id: faker.string.uuid(),
				label: faker.lorem.word(),
				value: faker.lorem.word(),
				email: faker.internet.email(),
				type: CALENDAR_RESOURCES.ROOM
			})).concat([editorMeetingRoomItem]);

			const label = faker.lorem.words(10);
			setupTest(
				<EditorAvailabilityWarningRow
					editorId={editor.id}
					label={label}
					items={items}
					list={[itemInList]}
				/>,
				{ store }
			);

			const labelSelector = screen.getByText(label);

			expect(labelSelector).toBeInTheDocument();
			expect(labelSelector).toBeVisible();
		});
		test('If a room is not busy at the time of the event, there wont be a warning string to inform the user', async () => {
			const freeStart = moment().startOf('day').valueOf();
			const freeEnd = moment().add(5, 'hours').valueOf();

			const roomId = faker.string.uuid();
			const roomEmail = faker.internet.email();

			const editorMeetingRoomItem = {
				id: roomId,
				label: faker.lorem.word(),
				value: faker.lorem.word(),
				email: roomEmail,
				type: CALENDAR_RESOURCES.ROOM
			};

			const itemInList = {
				id: roomId,
				email: roomEmail,
				b: [
					{
						s: moment().add(5, 'hours').valueOf(),
						e: moment().add(5, 'hours').add(30, 'minutes').valueOf()
					}
				],
				requestedDays: [moment().format(dateFormat)],
				t: [],
				f: [
					{
						s: freeStart,
						e: freeEnd
					},
					{
						s: moment().add(5, 'hours').add(30, 'minutes').valueOf(),
						e: moment().endOf('day').valueOf()
					}
				]
			};

			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					start: freeStart,
					end: freeEnd,
					meetingRoom: [editorMeetingRoomItem]
				}
			});

			const items = map({ length: 4 }, () => ({
				id: faker.string.uuid(),
				label: faker.lorem.word(),
				value: faker.lorem.word(),
				email: faker.internet.email(),
				type: CALENDAR_RESOURCES.ROOM
			})).concat([editorMeetingRoomItem]);

			const label = faker.lorem.words(10);
			setupTest(
				<EditorAvailabilityWarningRow
					editorId={editor.id}
					label={label}
					items={items}
					list={[itemInList]}
				/>,
				{ store }
			);

			const labelSelector = screen.queryByText(label);

			expect(labelSelector).not.toBeInTheDocument();
		});
	});
});
