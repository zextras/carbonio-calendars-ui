/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit';

import type { CalendarEditor, Editor, Resource } from '../../types/editor';
import type { EditorChipAttendees } from '../../types/store/invite';
import type { EditorSlice } from '../../types/store/store';
import {
	editEditorAllDayReducer,
	editEditorAttendeesReducer,
	editEditorAttachmentsReducer,
	editEditorCalendarReducer,
	editEditorClassReducer,
	editEditorDateReducer,
	editEditorDisplayStatusReducer,
	editEditorEquipmentReducer,
	editEditorMeetingRoomReducer,
	editEditorOptionalAttendeesReducer,
	editEditorRecurrenceReducer,
	editEditorReminderReducer,
	editEditorRoomReducer,
	editEditorTextReducer,
	editEditorTimezoneReducer,
	editIsRichTextReducer,
	editLocationReducer,
	editSenderReducer,
	editTitleReducer,
	newEditorReducer,
	updateEditorReducer
} from './editor-reducers';

const EDITOR_ID = 'editor-test-1';

const makeAttendee = (email: string): EditorChipAttendees => ({ email, label: email });

const makeEditor = (overrides: Partial<Editor> = {}): Editor => ({
	id: EDITOR_ID,
	isDirty: false,
	disabled: {},
	panel: false,
	isNew: false,
	isException: false,
	isInstance: false,
	isSeries: false,
	compNum: 0,
	title: 'Original Title',
	location: 'Original Location',
	richText: '<p>Original</p>',
	plainText: 'Original',
	isRichText: true,
	attachmentFiles: [],
	attendees: [],
	optionalAttendees: [],
	allDay: false,
	freeBusy: 'B',
	class: 'PUB',
	start: 1_000_000,
	end: 2_000_000,
	originalStart: 1_000_000,
	originalEnd: 2_000_000,
	organizer: { email: 'organizer@example.com', fullName: 'Organizer' },
	sender: { email: 'organizer@example.com', fullName: 'Organizer' },
	timezone: 'UTC',
	reminder: '5',
	...overrides
});

const makeState = (editor: Editor, originalOverrides: Partial<Editor> = {}): EditorSlice => ({
	status: 'idle',
	editors: { [editor.id]: { ...editor } },
	originalEditors: { [editor.id]: { ...editor, ...originalOverrides } }
});

// Produces a PayloadAction-shaped object without requiring RTK imports in tests.
const act = <T>(payload: T): PayloadAction<T> =>
	({ type: 'test/action', payload }) as PayloadAction<T>;

describe('newEditorReducer', () => {
	it('stores the editor in both editors and originalEditors', () => {
		const state: EditorSlice = { status: 'idle', editors: {}, originalEditors: {} };
		const editor = makeEditor();
		newEditorReducer(state, act(editor));
		expect(state.editors[EDITOR_ID]).toEqual({ ...editor, isDirty: false });
		expect(state.originalEditors[EDITOR_ID]).toEqual({ ...editor, isDirty: false });
	});

	it('forces isDirty to false regardless of the incoming value', () => {
		const state: EditorSlice = { status: 'idle', editors: {}, originalEditors: {} };
		const editor = makeEditor({ isDirty: true });
		newEditorReducer(state, act(editor));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
		expect(state.originalEditors[EDITOR_ID].isDirty).toBe(false);
	});
});

describe('editTitleReducer', () => {
	it('updates the title', () => {
		const editor = makeEditor();
		const state = makeState(editor);
		editTitleReducer(state, act({ id: EDITOR_ID, title: 'New Title' }));
		expect(state.editors[EDITOR_ID].title).toBe('New Title');
	});

	it('marks isDirty true when title differs from original', () => {
		const editor = makeEditor({ title: 'Original' });
		const state = makeState(editor);
		editTitleReducer(state, act({ id: EDITOR_ID, title: 'Changed' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when title matches original', () => {
		const editor = makeEditor({ title: 'Same' });
		const state = makeState(editor);
		editTitleReducer(state, act({ id: EDITOR_ID, title: 'Same' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is undefined', () => {
		const editor = makeEditor({ title: 'Original' });
		const state = makeState(editor);
		editTitleReducer(state, act({ id: undefined, title: 'New' }));
		expect(state.editors[EDITOR_ID].title).toBe('Original');
	});

	it('is a no-op when payload title is null', () => {
		const editor = makeEditor({ title: 'Original' });
		const state = makeState(editor);
		editTitleReducer(state, act({ id: EDITOR_ID, title: null as unknown as string }));
		expect(state.editors[EDITOR_ID].title).toBe('Original');
	});

	it('is a no-op when the editor title is undefined', () => {
		const editor = makeEditor({ title: undefined });
		const state = makeState(editor);
		editTitleReducer(state, act({ id: EDITOR_ID, title: 'New' }));
		expect(state.editors[EDITOR_ID].title).toBeUndefined();
	});

	it('marks isDirty true when no original editor exists', () => {
		const editor = makeEditor();
		const state: EditorSlice = {
			status: 'idle',
			editors: { [EDITOR_ID]: { ...editor } },
			originalEditors: {}
		};
		editTitleReducer(state, act({ id: EDITOR_ID, title: 'New' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});
});

describe('editLocationReducer', () => {
	it('updates the location', () => {
		const editor = makeEditor();
		const state = makeState(editor);
		editLocationReducer(state, act({ id: EDITOR_ID, location: 'New Location' }));
		expect(state.editors[EDITOR_ID].location).toBe('New Location');
	});

	it('marks isDirty true when location differs from original', () => {
		const state = makeState(makeEditor());
		editLocationReducer(state, act({ id: EDITOR_ID, location: 'Different' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when location matches original', () => {
		const editor = makeEditor({ location: 'Same' });
		const state = makeState(editor);
		editLocationReducer(state, act({ id: EDITOR_ID, location: 'Same' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is undefined', () => {
		const state = makeState(makeEditor({ location: 'Original' }));
		editLocationReducer(state, act({ id: undefined, location: 'New' }));
		expect(state.editors[EDITOR_ID].location).toBe('Original');
	});

	it('is a no-op when payload location is null', () => {
		const state = makeState(makeEditor({ location: 'Original' }));
		editLocationReducer(state, act({ id: EDITOR_ID, location: null as unknown as string }));
		expect(state.editors[EDITOR_ID].location).toBe('Original');
	});

	it('is a no-op when the editor location is undefined', () => {
		const state = makeState(makeEditor({ location: undefined }));
		editLocationReducer(state, act({ id: EDITOR_ID, location: 'New' }));
		expect(state.editors[EDITOR_ID].location).toBeUndefined();
	});
});

describe('editSenderReducer', () => {
	const newSender = { email: 'new@example.com', fullName: 'New Sender' };

	it('updates the sender', () => {
		const state = makeState(makeEditor());
		editSenderReducer(state, act({ id: EDITOR_ID, sender: newSender }));
		expect(state.editors[EDITOR_ID].sender).toEqual(newSender);
	});

	it('marks isDirty true when sender changes', () => {
		const state = makeState(makeEditor());
		editSenderReducer(state, act({ id: EDITOR_ID, sender: newSender }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when sender matches original', () => {
		const sender = { email: 'same@example.com', fullName: 'Same' };
		const state = makeState(makeEditor({ sender }));
		editSenderReducer(state, act({ id: EDITOR_ID, sender: { ...sender } }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is undefined', () => {
		const original = makeEditor().sender;
		const state = makeState(makeEditor());
		editSenderReducer(state, act({ id: undefined, sender: newSender }));
		expect(state.editors[EDITOR_ID].sender).toEqual(original);
	});

	it('is a no-op when payload sender is falsy', () => {
		const original = makeEditor().sender;
		const state = makeState(makeEditor());
		editSenderReducer(state, act({ id: EDITOR_ID, sender: null as unknown as typeof newSender }));
		expect(state.editors[EDITOR_ID].sender).toEqual(original);
	});
});

describe('editIsRichTextReducer', () => {
	it('updates isRichText', () => {
		const state = makeState(makeEditor({ isRichText: true }));
		editIsRichTextReducer(state, act({ id: EDITOR_ID, isRichText: false }));
		expect(state.editors[EDITOR_ID].isRichText).toBe(false);
	});

	it('marks isDirty true when isRichText changes', () => {
		const state = makeState(makeEditor({ isRichText: true }));
		editIsRichTextReducer(state, act({ id: EDITOR_ID, isRichText: false }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when isRichText matches original', () => {
		const state = makeState(makeEditor({ isRichText: false }));
		editIsRichTextReducer(state, act({ id: EDITOR_ID, isRichText: false }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is undefined', () => {
		const state = makeState(makeEditor({ isRichText: true }));
		editIsRichTextReducer(state, act({ id: undefined, isRichText: false }));
		expect(state.editors[EDITOR_ID].isRichText).toBe(true);
	});

	it('is a no-op when editor isRichText is undefined', () => {
		const state = makeState(makeEditor({ isRichText: undefined }));
		editIsRichTextReducer(state, act({ id: EDITOR_ID, isRichText: false }));
		expect(state.editors[EDITOR_ID].isRichText).toBeUndefined();
	});
});

describe('editEditorAttachmentsReducer', () => {
	it('sets attachmentFiles', () => {
		const files = [{ name: 'doc.pdf', size: 100 }];
		const state = makeState(makeEditor());
		editEditorAttachmentsReducer(state, act({ id: EDITOR_ID, attach: {}, attachmentFiles: files }));
		expect(state.editors[EDITOR_ID].attachmentFiles).toEqual(files);
	});

	it('defaults attachmentFiles to [] when payload is null', () => {
		const state = makeState(makeEditor());
		editEditorAttachmentsReducer(
			state,
			act({ id: EDITOR_ID, attach: {}, attachmentFiles: null as unknown as any[] })
		);
		expect(state.editors[EDITOR_ID].attachmentFiles).toEqual([]);
	});

	it('extracts aid from files that have an aid property', () => {
		const files = [{ aid: 'aid-1' }, { name: 'no-aid.pdf' }, { aid: 'aid-2' }];
		const state = makeState(makeEditor());
		editEditorAttachmentsReducer(state, act({ id: EDITOR_ID, attach: {}, attachmentFiles: files }));
		expect(state.editors[EDITOR_ID].attach?.aid).toEqual(['aid-1', 'aid-2']);
	});

	it('sets attach.mp from payload.attach.mp', () => {
		const mp = [{ part: '1', ct: 'application/pdf' }];
		const state = makeState(makeEditor());
		editEditorAttachmentsReducer(
			state,
			act({ id: EDITOR_ID, attach: { mp }, attachmentFiles: [] })
		);
		expect(state.editors[EDITOR_ID].attach?.mp).toEqual(mp);
	});

	it('falls back to existing editor attach.mp when payload has no mp', () => {
		const existingMp = [{ part: '2', ct: 'text/plain' }];
		const state = makeState(makeEditor({ attach: { mp: existingMp } }));
		editEditorAttachmentsReducer(state, act({ id: EDITOR_ID, attach: {}, attachmentFiles: [] }));
		expect(state.editors[EDITOR_ID].attach?.mp).toEqual(existingMp);
	});

	it('defaults attach.mp to [] when both payload and editor mp are absent', () => {
		const state = makeState(makeEditor({ attach: undefined }));
		editEditorAttachmentsReducer(state, act({ id: EDITOR_ID, attach: {}, attachmentFiles: [] }));
		expect(state.editors[EDITOR_ID].attach?.mp).toEqual([]);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor());
		editEditorAttachmentsReducer(
			state,
			act({ id: '', attach: {}, attachmentFiles: [{ name: 'file.pdf' }] })
		);
		expect(state.editors[EDITOR_ID].attachmentFiles).toEqual([]);
	});

	it('is a no-op when editor does not exist for the given id', () => {
		const state = makeState(makeEditor());
		editEditorAttachmentsReducer(
			state,
			act({ id: 'nonexistent', attach: {}, attachmentFiles: [{ name: 'file.pdf' }] })
		);
		expect(state.editors[EDITOR_ID].attachmentFiles).toEqual([]);
	});
});

describe('editEditorMeetingRoomReducer', () => {
	const rooms: Resource[] = [{ email: 'room@example.com', label: 'Room A' }];

	it('updates meetingRoom', () => {
		const state = makeState(makeEditor());
		editEditorMeetingRoomReducer(state, act({ id: EDITOR_ID, meetingRoom: rooms }));
		expect(state.editors[EDITOR_ID].meetingRoom).toEqual(rooms);
	});

	it('marks isDirty true when meetingRoom changes', () => {
		const state = makeState(makeEditor({ meetingRoom: [] }));
		editEditorMeetingRoomReducer(state, act({ id: EDITOR_ID, meetingRoom: rooms }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ meetingRoom: [] }));
		editEditorMeetingRoomReducer(state, act({ id: '', meetingRoom: rooms }));
		expect(state.editors[EDITOR_ID].meetingRoom).toEqual([]);
	});
});

describe('editEditorEquipmentReducer', () => {
	const equipment: Resource[] = [{ email: 'proj@example.com', label: 'Projector' }];

	it('updates equipment', () => {
		const state = makeState(makeEditor());
		editEditorEquipmentReducer(state, act({ id: EDITOR_ID, equipment }));
		expect(state.editors[EDITOR_ID].equipment).toEqual(equipment);
	});

	it('marks isDirty true when equipment changes', () => {
		const state = makeState(makeEditor({ equipment: [] }));
		editEditorEquipmentReducer(state, act({ id: EDITOR_ID, equipment }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ equipment: [] }));
		editEditorEquipmentReducer(state, act({ id: '', equipment }));
		expect(state.editors[EDITOR_ID].equipment).toEqual([]);
	});
});

describe('editEditorRoomReducer', () => {
	it('sets room when both label and link are provided', () => {
		const state = makeState(makeEditor());
		editEditorRoomReducer(
			state,
			act({
				id: EDITOR_ID,
				room: { label: 'Room A', link: 'https://meet.example.com', attendees: undefined }
			})
		);
		expect(state.editors[EDITOR_ID].room).toEqual({
			label: 'Room A',
			link: 'https://meet.example.com'
		});
	});

	it('clears room when label is missing', () => {
		const state = makeState(
			makeEditor({ room: { label: 'Old Room', link: 'https://old.example.com' } })
		);
		editEditorRoomReducer(
			state,
			act({
				id: EDITOR_ID,
				room: { label: '', link: 'https://meet.example.com', attendees: undefined }
			})
		);
		expect(state.editors[EDITOR_ID].room).toBeUndefined();
	});

	it('clears room when link is missing', () => {
		const state = makeState(
			makeEditor({ room: { label: 'Old Room', link: 'https://old.example.com' } })
		);
		editEditorRoomReducer(
			state,
			act({ id: EDITOR_ID, room: { label: 'Room A', link: '', attendees: undefined } })
		);
		expect(state.editors[EDITOR_ID].room).toBeUndefined();
	});

	it('appends room attendees to editor attendees and deduplicates by reference', () => {
		// lodash union deduplicates by reference (SameValueZero), so the same object
		// reference is deduplicated, while a distinct object with the same email is not.
		const alice = makeAttendee('alice@example.com');
		const bob = makeAttendee('bob@example.com');
		const existing = [alice];
		// alice is the same reference — union will deduplicate it; bob is new
		const roomAttendees = [alice, bob];
		const state = makeState(makeEditor({ attendees: existing }));
		editEditorRoomReducer(
			state,
			act({
				id: EDITOR_ID,
				room: { label: 'Room A', link: 'https://meet.example.com', attendees: roomAttendees }
			})
		);
		expect(state.editors[EDITOR_ID].attendees).toHaveLength(2);
		expect(state.editors[EDITOR_ID].attendees).toContain(alice);
		expect(state.editors[EDITOR_ID].attendees).toContain(bob);
	});

	it('does not modify attendees when room has no attendees', () => {
		const existing = [makeAttendee('alice@example.com')];
		const state = makeState(makeEditor({ attendees: existing }));
		editEditorRoomReducer(
			state,
			act({
				id: EDITOR_ID,
				room: { label: 'Room A', link: 'https://meet.example.com', attendees: undefined }
			})
		);
		expect(state.editors[EDITOR_ID].attendees).toEqual(existing);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ room: undefined }));
		editEditorRoomReducer(
			state,
			act({
				id: '',
				room: { label: 'Room A', link: 'https://meet.example.com', attendees: undefined }
			})
		);
		expect(state.editors[EDITOR_ID].room).toBeUndefined();
	});
});

describe('editEditorAttendeesReducer', () => {
	it('updates the attendees list', () => {
		const attendees = [makeAttendee('alice@example.com'), makeAttendee('bob@example.com')];
		const state = makeState(makeEditor());
		editEditorAttendeesReducer(state, act({ id: EDITOR_ID, attendees }));
		expect(state.editors[EDITOR_ID].attendees).toEqual(attendees);
	});

	it('marks isDirty false when attendee emails match original (same case, same order)', () => {
		const attendees = [makeAttendee('alice@example.com')];
		const state = makeState(makeEditor({ attendees }));
		editEditorAttendeesReducer(
			state,
			act({ id: EDITOR_ID, attendees: [makeAttendee('alice@example.com')] })
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('marks isDirty false when attendee emails match original regardless of case', () => {
		const original = [makeAttendee('Alice@Example.com')];
		const state = makeState(makeEditor({ attendees: original }));
		editEditorAttendeesReducer(
			state,
			act({ id: EDITOR_ID, attendees: [makeAttendee('alice@example.com')] })
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('marks isDirty false when attendee emails match original regardless of order', () => {
		const original = [makeAttendee('alice@example.com'), makeAttendee('bob@example.com')];
		const state = makeState(makeEditor({ attendees: original }));
		editEditorAttendeesReducer(
			state,
			act({
				id: EDITOR_ID,
				attendees: [makeAttendee('bob@example.com'), makeAttendee('alice@example.com')]
			})
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('marks isDirty true when attendee emails differ from original', () => {
		const original = [makeAttendee('alice@example.com')];
		const state = makeState(makeEditor({ attendees: original }));
		editEditorAttendeesReducer(
			state,
			act({ id: EDITOR_ID, attendees: [makeAttendee('carol@example.com')] })
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty true when attendee is added', () => {
		const state = makeState(makeEditor({ attendees: [] }));
		editEditorAttendeesReducer(
			state,
			act({ id: EDITOR_ID, attendees: [makeAttendee('alice@example.com')] })
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty true when attendee is removed', () => {
		const original = [makeAttendee('alice@example.com'), makeAttendee('bob@example.com')];
		const state = makeState(makeEditor({ attendees: original }));
		editEditorAttendeesReducer(
			state,
			act({ id: EDITOR_ID, attendees: [makeAttendee('alice@example.com')] })
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});
});

describe('editEditorOptionalAttendeesReducer', () => {
	it('updates optionalAttendees', () => {
		const attendees = [makeAttendee('optional@example.com')];
		const state = makeState(makeEditor());
		editEditorOptionalAttendeesReducer(state, act({ id: EDITOR_ID, optionalAttendees: attendees }));
		expect(state.editors[EDITOR_ID].optionalAttendees).toEqual(attendees);
	});

	it('marks isDirty false when optional attendee emails match original regardless of case and order', () => {
		const original = [makeAttendee('BOB@EXAMPLE.COM'), makeAttendee('alice@example.com')];
		const state = makeState(makeEditor({ optionalAttendees: original }));
		editEditorOptionalAttendeesReducer(
			state,
			act({
				id: EDITOR_ID,
				optionalAttendees: [makeAttendee('alice@example.com'), makeAttendee('bob@example.com')]
			})
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('marks isDirty true when optional attendees change', () => {
		const state = makeState(makeEditor({ optionalAttendees: [] }));
		editEditorOptionalAttendeesReducer(
			state,
			act({ id: EDITOR_ID, optionalAttendees: [makeAttendee('new@example.com')] })
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});
});

describe('editEditorDisplayStatusReducer', () => {
	it('updates freeBusy', () => {
		const state = makeState(makeEditor({ freeBusy: 'B' }));
		editEditorDisplayStatusReducer(state, act({ id: EDITOR_ID, freeBusy: 'F' }));
		expect(state.editors[EDITOR_ID].freeBusy).toBe('F');
	});

	it('marks isDirty true when freeBusy changes', () => {
		const state = makeState(makeEditor({ freeBusy: 'B' }));
		editEditorDisplayStatusReducer(state, act({ id: EDITOR_ID, freeBusy: 'T' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when freeBusy matches original', () => {
		const state = makeState(makeEditor({ freeBusy: 'O' }));
		editEditorDisplayStatusReducer(state, act({ id: EDITOR_ID, freeBusy: 'O' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when editor does not exist', () => {
		const state = makeState(makeEditor());
		editEditorDisplayStatusReducer(state, act({ id: 'nonexistent', freeBusy: 'F' }));
		expect(state.editors[EDITOR_ID].freeBusy).toBe('B');
	});
});

describe('editEditorCalendarReducer', () => {
	const newCalendar: CalendarEditor = { id: 'cal-2', name: 'Work Calendar' };

	it('updates the calendar', () => {
		const state = makeState(makeEditor());
		editEditorCalendarReducer(state, act({ id: EDITOR_ID, calendar: newCalendar }));
		expect(state.editors[EDITOR_ID].calendar).toEqual(newCalendar);
	});

	it('marks isDirty true when calendar changes', () => {
		const state = makeState(makeEditor({ calendar: { id: 'cal-1', name: 'Personal' } }));
		editEditorCalendarReducer(state, act({ id: EDITOR_ID, calendar: newCalendar }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when calendar matches original', () => {
		const state = makeState(makeEditor({ calendar: newCalendar }));
		editEditorCalendarReducer(state, act({ id: EDITOR_ID, calendar: { ...newCalendar } }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ calendar: undefined }));
		editEditorCalendarReducer(state, act({ id: '', calendar: newCalendar }));
		expect(state.editors[EDITOR_ID].calendar).toBeUndefined();
	});

	it('is a no-op when editor does not exist', () => {
		const state = makeState(makeEditor({ calendar: undefined }));
		editEditorCalendarReducer(state, act({ id: 'nonexistent', calendar: newCalendar }));
		expect(state.editors[EDITOR_ID].calendar).toBeUndefined();
	});
});

describe('editEditorClassReducer', () => {
	it('updates the class', () => {
		const state = makeState(makeEditor({ class: 'PUB' }));
		editEditorClassReducer(state, act({ id: EDITOR_ID, class: 'PRI' }));
		expect(state.editors[EDITOR_ID].class).toBe('PRI');
	});

	it('marks isDirty true when class changes', () => {
		const state = makeState(makeEditor({ class: 'PUB' }));
		editEditorClassReducer(state, act({ id: EDITOR_ID, class: 'CON' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when class matches original', () => {
		const state = makeState(makeEditor({ class: 'PRI' }));
		editEditorClassReducer(state, act({ id: EDITOR_ID, class: 'PRI' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ class: 'PUB' }));
		editEditorClassReducer(state, act({ id: undefined, class: 'PRI' }));
		expect(state.editors[EDITOR_ID].class).toBe('PUB');
	});
});

describe('editEditorDateReducer', () => {
	it('updates both start and end', () => {
		const state = makeState(makeEditor({ start: 1_000, end: 2_000 }));
		editEditorDateReducer(state, act({ id: EDITOR_ID, start: 5_000, end: 6_000 }));
		expect(state.editors[EDITOR_ID].start).toBe(5_000);
		expect(state.editors[EDITOR_ID].end).toBe(6_000);
	});

	it('marks isDirty true when dates change', () => {
		const state = makeState(makeEditor({ start: 1_000, end: 2_000 }));
		editEditorDateReducer(state, act({ id: EDITOR_ID, start: 3_000, end: 4_000 }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when dates match original', () => {
		const state = makeState(makeEditor({ start: 1_000, end: 2_000 }));
		editEditorDateReducer(state, act({ id: EDITOR_ID, start: 1_000, end: 2_000 }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ start: 1_000, end: 2_000 }));
		editEditorDateReducer(state, act({ id: '', start: 5_000, end: 6_000 }));
		expect(state.editors[EDITOR_ID].start).toBe(1_000);
		expect(state.editors[EDITOR_ID].end).toBe(2_000);
	});
});

describe('editEditorTextReducer', () => {
	it('updates richText and plainText', () => {
		const state = makeState(makeEditor());
		editEditorTextReducer(state, act({ id: EDITOR_ID, richText: '<p>New</p>', plainText: 'New' }));
		expect(state.editors[EDITOR_ID].richText).toBe('<p>New</p>');
		expect(state.editors[EDITOR_ID].plainText).toBe('New');
	});

	it('marks isDirty true when text changes', () => {
		const state = makeState(makeEditor({ richText: '<p>Old</p>', plainText: 'Old' }));
		editEditorTextReducer(state, act({ id: EDITOR_ID, richText: '<p>New</p>', plainText: 'New' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when text matches original', () => {
		const state = makeState(makeEditor({ richText: '<p>Same</p>', plainText: 'Same' }));
		editEditorTextReducer(
			state,
			act({ id: EDITOR_ID, richText: '<p>Same</p>', plainText: 'Same' })
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ plainText: 'Original' }));
		editEditorTextReducer(state, act({ id: undefined, richText: '<p>New</p>', plainText: 'New' }));
		expect(state.editors[EDITOR_ID].plainText).toBe('Original');
	});
});

describe('editEditorAllDayReducer', () => {
	it('updates allDay', () => {
		const state = makeState(makeEditor({ allDay: false }));
		editEditorAllDayReducer(state, act({ id: EDITOR_ID, allDay: true }));
		expect(state.editors[EDITOR_ID].allDay).toBe(true);
	});

	it('marks isDirty true when allDay changes', () => {
		const state = makeState(makeEditor({ allDay: false }));
		editEditorAllDayReducer(state, act({ id: EDITOR_ID, allDay: true }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when allDay matches original', () => {
		const state = makeState(makeEditor({ allDay: true }));
		editEditorAllDayReducer(state, act({ id: EDITOR_ID, allDay: true }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ allDay: false }));
		editEditorAllDayReducer(state, act({ id: undefined, allDay: true }));
		expect(state.editors[EDITOR_ID].allDay).toBe(false);
	});
});

describe('editEditorTimezoneReducer', () => {
	it('updates timezone', () => {
		const state = makeState(makeEditor({ timezone: 'UTC' }));
		editEditorTimezoneReducer(state, act({ id: EDITOR_ID, timezone: 'America/New_York' }));
		expect(state.editors[EDITOR_ID].timezone).toBe('America/New_York');
	});

	it('marks isDirty true when timezone changes', () => {
		const state = makeState(makeEditor({ timezone: 'UTC' }));
		editEditorTimezoneReducer(state, act({ id: EDITOR_ID, timezone: 'Europe/Rome' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when timezone matches original', () => {
		const state = makeState(makeEditor({ timezone: 'UTC' }));
		editEditorTimezoneReducer(state, act({ id: EDITOR_ID, timezone: 'UTC' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ timezone: 'UTC' }));
		editEditorTimezoneReducer(state, act({ id: undefined, timezone: 'America/New_York' }));
		expect(state.editors[EDITOR_ID].timezone).toBe('UTC');
	});
});

describe('editEditorReminderReducer', () => {
	it('updates reminder', () => {
		const state = makeState(makeEditor({ reminder: '5' }));
		editEditorReminderReducer(state, act({ id: EDITOR_ID, reminder: '15' }));
		expect(state.editors[EDITOR_ID].reminder).toBe('15');
	});

	it('marks isDirty true when reminder changes', () => {
		const state = makeState(makeEditor({ reminder: '5' }));
		editEditorReminderReducer(state, act({ id: EDITOR_ID, reminder: '30' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when reminder matches original', () => {
		const state = makeState(makeEditor({ reminder: '10' }));
		editEditorReminderReducer(state, act({ id: EDITOR_ID, reminder: '10' }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ reminder: '5' }));
		editEditorReminderReducer(state, act({ id: undefined, reminder: '30' }));
		expect(state.editors[EDITOR_ID].reminder).toBe('5');
	});
});

describe('editEditorRecurrenceReducer', () => {
	const recur = { add: [{ rule: [{ freq: 'DAI', interval: [{ ival: 1 }] }] }] };

	it('updates recur', () => {
		const state = makeState(makeEditor({ recur: undefined }));
		editEditorRecurrenceReducer(state, act({ id: EDITOR_ID, recur }));
		expect(state.editors[EDITOR_ID].recur).toEqual(recur);
	});

	it('marks isDirty true when recurrence changes', () => {
		const state = makeState(makeEditor({ recur: undefined }));
		editEditorRecurrenceReducer(state, act({ id: EDITOR_ID, recur }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(true);
	});

	it('marks isDirty false when recurrence matches original', () => {
		const state = makeState(makeEditor({ recur }));
		editEditorRecurrenceReducer(state, act({ id: EDITOR_ID, recur: { ...recur } }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ recur: undefined }));
		editEditorRecurrenceReducer(state, act({ id: undefined, recur }));
		expect(state.editors[EDITOR_ID].recur).toBeUndefined();
	});
});

describe('updateEditorReducer', () => {
	it('merges new editor data into the existing editor', () => {
		const state = makeState(makeEditor({ title: 'Old Title' }));
		const updates: Partial<Editor> = { title: 'New Title', location: 'New Location' };
		updateEditorReducer(state, act({ id: EDITOR_ID, editor: updates as Editor }));
		expect(state.editors[EDITOR_ID].title).toBe('New Title');
		expect(state.editors[EDITOR_ID].location).toBe('New Location');
	});

	it('resets isDirty to false after update', () => {
		const editor = makeEditor({ isDirty: true });
		const state = makeState(editor);
		updateEditorReducer(state, act({ id: EDITOR_ID, editor: { title: 'Saved' } as Editor }));
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});

	it('syncs originalEditors to match the saved state', () => {
		const state = makeState(makeEditor());
		updateEditorReducer(state, act({ id: EDITOR_ID, editor: { title: 'Synced' } as Editor }));
		expect(state.originalEditors[EDITOR_ID].title).toBe('Synced');
		expect(state.originalEditors[EDITOR_ID]).toEqual(state.editors[EDITOR_ID]);
	});

	it('is a no-op when payload id is falsy', () => {
		const state = makeState(makeEditor({ title: 'Original' }));
		updateEditorReducer(state, act({ id: '', editor: { title: 'Changed' } as Editor }));
		expect(state.editors[EDITOR_ID].title).toBe('Original');
	});

	it('is a no-op when editor does not exist for the given id', () => {
		const state = makeState(makeEditor({ title: 'Original' }));
		updateEditorReducer(state, act({ id: 'nonexistent', editor: { title: 'Changed' } as Editor }));
		expect(state.editors[EDITOR_ID].title).toBe('Original');
	});
});

describe('isDirty ignores metadata fields', () => {
	it('does not mark dirty when only metadata fields change', () => {
		const state = makeState(makeEditor({ compNum: 0, isNew: false }));
		// Simulate a metadata-only change: change compNum in editors without going through any reducer
		// We test via editEditorDateReducer with same dates (no content change) after mutating a metadata field
		state.editors[EDITOR_ID].compNum = 99;
		state.editors[EDITOR_ID].isNew = true;
		// Now trigger recomputeIsDirty through a reducer with an unchanged value
		editEditorDateReducer(
			state,
			act({
				id: EDITOR_ID,
				start: state.editors[EDITOR_ID].start!,
				end: state.editors[EDITOR_ID].end!
			})
		);
		expect(state.editors[EDITOR_ID].isDirty).toBe(false);
	});
});
