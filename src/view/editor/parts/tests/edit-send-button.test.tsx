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
});
