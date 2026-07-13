/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { reducers } from '../../store/redux';
import { selectEditor } from '../../store/selectors/editor';
import { createNewEditor } from '../../store/slices/editor-slice';
import { Editor } from '../../types/editor';
import { onSave, onSend } from '../editor-save-send-fns';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

vi.mock('../../normalizations/normalize-soap-message-from-editor', () => ({
	normalizeSoapMessageFromEditor: vi.fn(() => ({}))
}));

const EXISTING_ATTENDEE = { email: 'existing@test.com' };
const NEW_ATTENDEE = { email: 'new@test.com' };

const buildEditor = (overrides: Partial<Editor>): Editor =>
	({
		id: 'editor-id',
		isNew: false,
		isSeries: false,
		isInstance: false,
		isException: false,
		allDay: false,
		timezone: 'UTC',
		originalStart: Date.now(),
		attachmentFiles: [],
		attendees: [EXISTING_ATTENDEE],
		optionalAttendees: [],
		notifiedAttendees: [EXISTING_ATTENDEE.email],
		notifiedOptionalAttendees: [],
		...overrides
	}) as unknown as Editor;

describe('notifiedAttendees tracking across save/send', () => {
	it('does not mark a newly added attendee as notified when saving without sending', async () => {
		createSoapAPIInterceptor('ModifyAppointment', { calItemId: '1', echo: [] });
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = buildEditor({ attendees: [EXISTING_ATTENDEE, NEW_ATTENDEE] });
		store.dispatch(createNewEditor(editor));

		await onSave({ draft: true, isNew: false, editor, dispatch: store.dispatch });

		expect(selectEditor(editor.id)(store.getState()).notifiedAttendees).toEqual([
			EXISTING_ATTENDEE.email
		]);
	});

	it('marks the newly added attendee as notified once an actual send happens', async () => {
		createSoapAPIInterceptor('ModifyAppointment', { calItemId: '1', echo: [] });
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = buildEditor({ attendees: [EXISTING_ATTENDEE, NEW_ATTENDEE] });
		store.dispatch(createNewEditor(editor));

		await onSend({ isNew: false, editor, dispatch: store.dispatch });

		expect(selectEditor(editor.id)(store.getState()).notifiedAttendees).toEqual(
			expect.arrayContaining([EXISTING_ATTENDEE.email, NEW_ATTENDEE.email])
		);
	});
});
