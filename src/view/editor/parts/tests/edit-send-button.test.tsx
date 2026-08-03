/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { combineReducers } from 'redux';
import { Mock } from 'vitest';

import { generateEditor } from '../../../../commons/editor-generator';
import { onSend } from '../../../../commons/editor-save-send-fns';
import { reducers } from '../../../../store/redux';
import { editEditorAttendees } from '../../../../store/slices/editor-slice';
import { EditorSendButton } from '../editor-send-button';
import { setupTest } from '@test-setup';

vi.mock('../../../../commons/editor-save-send-fns', () => ({
	onSend: vi.fn()
}));

const DEFAULT_ATTENDEE = { email: 'user@test.com' };

describe('EditorSendButton', () => {
	it('should disable send button when event has no title', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				attendees: [DEFAULT_ATTENDEE],
				title: ''
			}
		});

		setupTest(<EditorSendButton editorId={editor.id} />, { store });

		expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
	});

	it('should enable send button when title and attendees are present', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Meeting',
				attendees: [DEFAULT_ATTENDEE]
			}
		});

		setupTest(<EditorSendButton editorId={editor.id} />, { store });

		expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
	});

	it('should call onSend when clicking send', async () => {
		(onSend as Mock).mockResolvedValue({ response: true });

		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Meeting',
				attendees: [DEFAULT_ATTENDEE]
			}
		});

		const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });

		await user.click(screen.getByRole('button', { name: /send/i }));

		await waitFor(() => {
			expect(onSend).toHaveBeenCalled();
		});
	});
	it('should show disabled tooltip when sendButton is disabled', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Meeting',
				attendees: [DEFAULT_ATTENDEE],
				disabled: { sendButton: true }
			}
		});

		const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /send/i });
		expect(button).toBeDisabled();

		await user.hover(button);

		expect(await screen.findByText('Sending is disabled for this event')).toBeInTheDocument();
	});

	it('should disable send button and show tooltip when no attendees or resources are provided', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Meeting',
				attendees: [],
				optionalAttendees: []
			}
		});

		const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /send/i });
		expect(button).toBeDisabled();

		await user.hover(button);

		expect(
			await screen.findByText('Add at least one attendee or resource to send')
		).toBeInTheDocument();
	});

	it('should disable send button and show tooltip when title is missing', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: '',
				attendees: [{ email: 'user@test.com' }]
			}
		});

		const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /send/i });
		expect(button).toBeDisabled();

		await user.hover(button);

		expect(await screen.findByText('Add event title to send')).toBeInTheDocument();
	});

	describe('send update modal for existing appointments', () => {
		it('opens the send-update modal when attendees changed on an existing appointment', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					title: 'Team Meeting',
					isNew: false,
					attendees: [DEFAULT_ATTENDEE]
				}
			});
			store.dispatch(
				editEditorAttendees({
					id: editor.id,
					attendees: [DEFAULT_ATTENDEE, { email: 'new-attendee@test.com' }]
				})
			);

			const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /send/i }));

			expect(
				await screen.findByText("You've changed the attendee list. Who should get the update?")
			).toBeInTheDocument();
			expect(onSend).not.toHaveBeenCalled();
		});

		it('does not open the send-update modal when an attendee is only removed', async () => {
			(onSend as Mock).mockResolvedValue({ response: true });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					title: 'Team Meeting',
					isNew: false,
					attendees: [DEFAULT_ATTENDEE, { email: 'removed-attendee@test.com' }]
				}
			});
			store.dispatch(
				editEditorAttendees({
					id: editor.id,
					attendees: [DEFAULT_ATTENDEE]
				})
			);

			const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /send/i }));

			await waitFor(() => {
				expect(onSend).toHaveBeenCalled();
			});
			expect(
				screen.queryByText("You've changed the attendee list. Who should get the update?")
			).not.toBeInTheDocument();
		});

		it('opens the send-update modal when an attendee is removed and another is added', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					title: 'Team Meeting',
					isNew: false,
					attendees: [DEFAULT_ATTENDEE, { email: 'removed-attendee@test.com' }]
				}
			});
			store.dispatch(
				editEditorAttendees({
					id: editor.id,
					attendees: [DEFAULT_ATTENDEE, { email: 'new-attendee@test.com' }]
				})
			);

			const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /send/i }));

			expect(
				await screen.findByText("You've changed the attendee list. Who should get the update?")
			).toBeInTheDocument();
			expect(onSend).not.toHaveBeenCalled();
		});

		it('does not open the send-update modal for a new appointment even if attendees changed', async () => {
			(onSend as Mock).mockResolvedValue({ response: true });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					title: 'Team Meeting',
					isNew: true,
					attendees: [DEFAULT_ATTENDEE]
				}
			});
			store.dispatch(
				editEditorAttendees({
					id: editor.id,
					attendees: [DEFAULT_ATTENDEE, { email: 'new-attendee@test.com' }]
				})
			);

			const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /send/i }));

			await waitFor(() => {
				expect(onSend).toHaveBeenCalled();
			});
			expect(
				screen.queryByText("You've changed the attendee list. Who should get the update?")
			).not.toBeInTheDocument();
		});

		it('does not open the send-update modal when attendees are unchanged on an existing appointment', async () => {
			(onSend as Mock).mockResolvedValue({ response: true });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					title: 'Team Meeting',
					isNew: false,
					attendees: [DEFAULT_ATTENDEE]
				}
			});

			const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /send/i }));

			await waitFor(() => {
				expect(onSend).toHaveBeenCalled();
			});
			expect(
				screen.queryByText("You've changed the attendee list. Who should get the update?")
			).not.toBeInTheDocument();
		});

		it('calls onSend with only the newly added attendee when that option is confirmed', async () => {
			(onSend as Mock).mockResolvedValue({ response: true });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					title: 'Team Meeting',
					isNew: false,
					attendees: [DEFAULT_ATTENDEE]
				}
			});
			const newAttendee = { email: 'new-attendee@test.com' };
			store.dispatch(
				editEditorAttendees({
					id: editor.id,
					attendees: [DEFAULT_ATTENDEE, newAttendee]
				})
			);

			const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /send/i }));
			await user.click(await screen.findByRole('button', { name: 'Confirm' }));

			await waitFor(() => {
				expect(onSend).toHaveBeenCalledWith(
					expect.objectContaining({
						notifyAttendees: expect.objectContaining({
							attendees: [expect.objectContaining({ email: 'new-attendee@test.com' })]
						})
					})
				);
			});
		});

		it('calls onSend without a notifyAttendees override when "All attendees" is confirmed', async () => {
			(onSend as Mock).mockResolvedValue({ response: true });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					title: 'Team Meeting',
					isNew: false,
					attendees: [DEFAULT_ATTENDEE]
				}
			});
			store.dispatch(
				editEditorAttendees({
					id: editor.id,
					attendees: [DEFAULT_ATTENDEE, { email: 'new-attendee@test.com' }]
				})
			);

			const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /send/i }));
			await user.click(await screen.findByText('All attendees'));
			await user.click(screen.getByRole('button', { name: 'Confirm' }));

			await waitFor(() => {
				expect(onSend).toHaveBeenCalledWith(
					expect.objectContaining({ notifyAttendees: undefined })
				);
			});
		});
	});
});
