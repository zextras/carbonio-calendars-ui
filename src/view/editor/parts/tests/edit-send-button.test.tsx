/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { setupTest } from '@test-setup';
import { screen, waitFor } from '@testing-library/react';
import { combineReducers } from 'redux';

import { generateEditor } from '../../../../commons/editor-generator';
import { onSend } from '../../../../commons/editor-save-send-fns';
import { reducers } from '../../../../store/redux';
import { EditorSendButton } from '../editor-send-button';

jest.mock('../../../../commons/editor-save-send-fns', () => ({
	onSend: jest.fn()
}));

const DEFAULT_ATTENDEE = { email: 'user@test.com' };

describe('EditorSendButton', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

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
		(onSend as jest.Mock).mockResolvedValue({ response: true });

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
});
