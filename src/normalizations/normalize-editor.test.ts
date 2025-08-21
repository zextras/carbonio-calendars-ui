/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { normalizeEditor } from './normalize-editor';
import { createEmptyEditor } from '../commons/editor-generator';
import mockedData from '../test/generators';

describe('normalizeEditor', () => {
	test('If event and invite are not available, it will return empty editor', () => {
		const folders = mockedData.calendars.getCalendarsMap();
		const emptyEditor = createEmptyEditor('1', folders);
		const result = normalizeEditor({ emptyEditor, context: { folders, dispatch: jest.fn() } });
		expect(result).toStrictEqual(emptyEditor);
	});
	test('if event and invite are available, it will return a compiled editor', () => {
		const folders = mockedData.calendars.getCalendarsMap();
		const emptyEditor = createEmptyEditor('1', folders);
		const event = mockedData.getEvent({
			title: faker.word.adjective(),
			resource: { compNum: 3, location: faker.location.country() }
		});
		const invite = mockedData.getInvite({ event });
		const result = normalizeEditor({
			invite,
			event,
			emptyEditor,
			context: { folders, dispatch: jest.fn() }
		});

		expect(result.title).toEqual(event.title);
		expect(result.compNum).toEqual(event.resource.compNum);
		expect(result.location).toEqual(event.resource.location);
	});
	describe('normalize calendar property', () => {
		test('if calendarId is undefined it will refer to default calendar', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				title: faker.word.adjective(),
				resource: {
					calendar: {
						id: undefined
					}
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: jest.fn() }
			});

			expect(result.calendar?.id).toBe(FOLDERS.CALENDAR);
		});
		test('if calendarId is referring to a folder which is not available in context it will fallback to default calendar', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				title: faker.word.adjective(),
				resource: {
					calendar: {
						id: 'non-existing-folder'
					}
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: jest.fn() }
			});

			expect(result.calendar?.id).toBe(FOLDERS.CALENDAR);
		});
		test('if calendarId is referring to a folder which is available in context it will be used', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				title: faker.word.adjective(),
				resource: {
					calendar: {
						id: FOLDERS.CALENDAR
					}
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: jest.fn() }
			});

			expect(result.calendar?.id).toBe(FOLDERS.CALENDAR);
		});
	});
	describe('normalize isInstance property', () => {
		test('isInstance true when event.resource.ridZ is defined and context.isInstance is undefined', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				resource: {
					ridZ: faker.string.uuid()
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: jest.fn() }
			});

			expect(result.isInstance).toBe(true);
		});
		test('isInstance false when both context.isInstance and event.resource.ridZ are undefined', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				resource: {
					ridZ: undefined
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: jest.fn() }
			});

			expect(result.isInstance).toBe(false);
		});
		test('isInstance true when context.isInstance is true', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				resource: {
					ridZ: undefined
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: jest.fn(), isInstance: true }
			});

			expect(result.isInstance).toBe(true);
		});
		test('isInstance true when context.isInstance is true', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				resource: {
					ridZ: faker.string.uuid()
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: jest.fn(), isInstance: false }
			});

			expect(result.isInstance).toBe(false);
		});
	});
});
