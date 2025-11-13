/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { EditorSaveButton } from '../editor-save-button';
import { EditorSendButton } from '../editor-send-button';
import { setupTest } from '@test-setup';
import { generateEditor } from 'commons/editor-generator';
import { reducers } from 'store/redux';

const DEFAULT_ATTENDEE = { email: 'user@test.com' };

describe('Editor button hooks - resource validation and messaging', () => {
	it('disables Save button and shows resource error tooltip when an invalid resource is present', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const invalidMeetingRoom = { label: 'Room Without Email', email: '' }; // invalid (missing email)
		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Valid Title',
				meetingRoom: [invalidMeetingRoom]
			}
		});

		const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /save/i });
		expect(button).toBeDisabled();

		await user.hover(button);
		expect(await screen.findByText('Fix input errors to save')).toBeInTheDocument();
	});

	it('disables Send button and shows duplicate resource tooltip when duplicate equipment entries exist', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const duplicateEquipmentEmail = 'equip@test.com';
		const equipment1 = { label: 'Projector', email: duplicateEquipmentEmail };
		const equipment2 = { label: 'Projector Duplicate', email: duplicateEquipmentEmail }; // duplicate

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Sync',
				attendees: [DEFAULT_ATTENDEE],
				equipment: [equipment1, equipment2]
			}
		});

		const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /send/i });
		expect(button).toBeDisabled();

		await user.hover(button);
		expect(await screen.findByText('Fix input errors to send')).toBeInTheDocument();
	});

	it('enables Save button when title and valid resources are present', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const validMeetingRoom = { label: 'Room A', email: 'roomA@test.com' };

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Planning Session',
				meetingRoom: [validMeetingRoom]
			}
		});

		setupTest(<EditorSaveButton editorId={editor.id} />, { store });
		expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
	});

	it('enables Send button when recipients and valid resources are present', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const validEquipment = { label: 'Projector', email: 'proj@test.com' };

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Review Meeting',
				attendees: [DEFAULT_ATTENDEE],
				equipment: [validEquipment]
			}
		});

		setupTest(<EditorSendButton editorId={editor.id} />, { store });
		expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
	});

	it('disables Send button and shows no recipients tooltip when only title is present', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Standalone'
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

	it('disables Save button and shows title tooltip when title is missing', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: '',
				attendees: [DEFAULT_ATTENDEE]
			}
		});

		const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /save/i });
		expect(button).toBeDisabled();
		await user.hover(button);
		expect(await screen.findByText('Add event title to save')).toBeInTheDocument();
	});

	it('disables Send button and shows disabled flag tooltip when sendButton is explicitly disabled', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Flag Disabled',
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

	it('disables Save button and shows disabled flag tooltip when saveButton is explicitly disabled', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Flag Disabled',
				attendees: [DEFAULT_ATTENDEE],
				disabled: { saveButton: true }
			}
		});

		const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /save/i });
		expect(button).toBeDisabled();
		await user.hover(button);
		expect(await screen.findByText('Saving is disabled for this event')).toBeInTheDocument();
	});

	it('handles undefined attendees and optional attendees gracefully in Send button', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Event with null recipients',
				attendees: undefined,
				optionalAttendees: undefined
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

	it('disables Save button due to resource issues when title is present but resources are invalid', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const invalidEquipment = { label: 'Equipment Without Email', email: '' };

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Valid Title Present',
				equipment: [invalidEquipment]
			}
		});

		const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /save/i });
		expect(button).toBeDisabled();
		await user.hover(button);
		expect(await screen.findByText('Fix input errors to save')).toBeInTheDocument();
	});

	it('disables Send button due to resource issues when title and recipients are present but resources are duplicated', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const duplicateRoomEmail = 'room@test.com';
		const room1 = { label: 'Room A', email: duplicateRoomEmail };
		const room2 = { label: 'Room B', email: duplicateRoomEmail };

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Valid Title',
				attendees: [DEFAULT_ATTENDEE],
				meetingRoom: [room1, room2]
			}
		});

		const { user } = setupTest(<EditorSendButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /send/i });
		expect(button).toBeDisabled();
		await user.hover(button);
		expect(await screen.findByText('Fix input errors to send')).toBeInTheDocument();
	});
});
