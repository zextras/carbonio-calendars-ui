/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { createEmptyEditor } from '../../commons/editor-generator';
import mockedData from '../../test/generators';
import { normalizeEditor } from '../normalize-editor';

describe('normalizeEditor', () => {
	test('If event and invite are not available, it will return empty editor', () => {
		const folders = mockedData.calendars.getCalendarsMap();
		const emptyEditor = createEmptyEditor('1', folders);
		const result = normalizeEditor({ emptyEditor, context: { folders, dispatch: vi.fn() } });
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
			context: { folders, dispatch: vi.fn() }
		});

		const expectedResult = {
			allDay: false,
			attach: {
				mp: []
			},
			attachmentFiles: [],
			attendees: [],
			calendar: expect.objectContaining({ id: event.resource.calendar.id }),
			class: invite.class,
			compNum: invite.compNum,
			disabled: {
				allDay: false,
				attachments: false,
				attachmentsButton: false,
				attendees: false,
				calendarSelector: false,
				composer: false,
				datePicker: false,
				equipment: false,
				freeBusySelector: false,
				location: false,
				meetingRoom: false,
				optionalAttendees: false,
				organizer: false,
				private: false,
				recurrence: false,
				reminder: false,
				richTextButton: false,
				saveButton: false,
				sendButton: false,
				timezone: false,
				title: false,
				virtualRoom: false
			},
			end: event.end.valueOf(),
			freeBusy: invite.freeBusy,
			id: emptyEditor.id,
			recur: undefined,
			room: undefined,
			inviteId: event.resource.inviteId,
			isException: false,
			isInstance: true,
			isNew: false,
			isRichText: true,
			isSeries: false,
			location: event.resource.location,
			ms: 1,
			optionalAttendees: [],
			organizer: {
				email: event.resource.organizer?.email,
				fullName: event.resource.organizer?.name
			},
			originalEnd: event.end.valueOf(),
			originalStart: event.start.valueOf(),
			panel: false,
			parts: [],
			equipment: undefined,
			exceptId: undefined,
			meetingRoom: undefined,
			plainText: '',
			reminder: invite.alarmValue,
			rev: 1,
			richText: '',
			ridZ: '1234',
			sender: emptyEditor.sender,
			start: event.start.valueOf(),
			timezone: emptyEditor.timezone,
			title: event.title,
			uid: '',
			isDirty: false
		};

		expect(result).toStrictEqual(expectedResult);
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
				context: { folders, dispatch: vi.fn() }
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
				context: { folders, dispatch: vi.fn() }
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
				context: { folders, dispatch: vi.fn() }
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
				context: { folders, dispatch: vi.fn() }
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
				context: { folders, dispatch: vi.fn() }
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
				context: { folders, dispatch: vi.fn(), isInstance: true }
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
				context: { folders, dispatch: vi.fn(), isInstance: false }
			});

			expect(result.isInstance).toBe(false);
		});
	});
	describe('compNum property', () => {
		test('if it is undefined it will default to 0', () => {
			const folders = mockedData.calendars.getCalendarsMap();
			const emptyEditor = createEmptyEditor('1', folders);
			const event = mockedData.getEvent({
				resource: {
					compNum: undefined
				}
			});
			const invite = mockedData.getInvite({ event });
			const result = normalizeEditor({
				invite,
				event,
				emptyEditor,
				context: { folders, dispatch: vi.fn() }
			});

			expect(result.compNum).toBe(0);
		});
	});
});
