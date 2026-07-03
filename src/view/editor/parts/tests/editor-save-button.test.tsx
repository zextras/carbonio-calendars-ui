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
import { onSave } from '../../../../commons/editor-save-send-fns';
import { reducers } from '../../../../store/redux';
import { editEditorAttendees } from '../../../../store/slices/editor-slice';
import { EditorSaveButton } from '../editor-save-button';
import { setupTest } from '@test-setup';

vi.mock('../../../../commons/editor-save-send-fns', () => ({
	onSave: vi.fn()
}));

const DEFAULT_ATTENDEE = { email: 'user@test.com' };

describe('EditorSaveButton', () => {
	it('should disable save button when event has no title', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: '',
				attendees: [DEFAULT_ATTENDEE]
			}
		});

		setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
	});

	it('should enable save button when title is present', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Meeting',
				attendees: [DEFAULT_ATTENDEE]
			}
		});

		setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
	});

	it('should call onSave when clicking save', async () => {
		(onSave as Mock).mockResolvedValue({ response: true });

		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Meeting',
				attendees: [DEFAULT_ATTENDEE]
			}
		});

		const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		await user.click(screen.getByRole('button', { name: /save/i }));

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(
				expect.objectContaining({
					draft: true,
					isNew: editor.isNew,
					editor,
					dispatch: store.dispatch
				})
			);
		});
	});

	it('should open series warning modal when editing a series event', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Series Event',
				attendees: [DEFAULT_ATTENDEE],
				isSeries: true,
				isNew: false,
				isInstance: false
			}
		});

		const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		await user.click(screen.getByRole('button', { name: /save/i }));

		expect(await screen.findByText('label.warning')).toBeInTheDocument();
		expect(screen.getByText('message.edit_series_warning')).toBeInTheDocument();
	});

	it('should disable save button when disabled.saveButton is true', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				title: 'Team Meeting',
				attendees: [DEFAULT_ATTENDEE],
				disabled: { saveButton: true }
			}
		});

		setupTest(<EditorSaveButton editorId={editor.id} />, { store });

		const button = screen.getByRole('button', { name: /save/i });
		expect(button).toBeDisabled();
	});

	describe('send update modal for existing appointments', () => {
		it('opens the send-update modal (with the "save without sending" option) when attendees changed', async () => {
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

			const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /save/i }));

			expect(
				await screen.findByText("You've changed the attendee list. Who should get the update?")
			).toBeInTheDocument();
			expect(screen.getByText('Save without sending')).toBeInTheDocument();
			expect(onSave).not.toHaveBeenCalled();
		});

		it('does not open the send-update modal when attendees are unchanged', async () => {
			(onSave as Mock).mockResolvedValue({ response: true });
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

			const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /save/i }));

			await waitFor(() => {
				expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ draft: true }));
			});
			expect(
				screen.queryByText("You've changed the attendee list. Who should get the update?")
			).not.toBeInTheDocument();
		});

		it('calls onSave with draft:false and only the new attendee when "only added" is confirmed', async () => {
			(onSave as Mock).mockResolvedValue({ response: true });
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

			const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /save/i }));
			await user.click(await screen.findByRole('button', { name: 'Confirm' }));

			await waitFor(() => {
				expect(onSave).toHaveBeenCalledWith(
					expect.objectContaining({
						draft: false,
						notifyAttendees: expect.objectContaining({
							attendees: [expect.objectContaining({ email: 'new-attendee@test.com' })]
						})
					})
				);
			});
		});

		it('calls onSave with draft:false and no override when "All attendees" is confirmed', async () => {
			(onSave as Mock).mockResolvedValue({ response: true });
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

			const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /save/i }));
			await user.click(await screen.findByText('All attendees'));
			await user.click(screen.getByRole('button', { name: 'Confirm' }));

			await waitFor(() => {
				expect(onSave).toHaveBeenCalledWith(
					expect.objectContaining({ draft: false, notifyAttendees: undefined })
				);
			});
		});

		it('calls onSave with draft:true when "Save without sending" is confirmed', async () => {
			(onSave as Mock).mockResolvedValue({ response: true });
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

			const { user } = setupTest(<EditorSaveButton editorId={editor.id} />, { store });
			await user.click(screen.getByRole('button', { name: /save/i }));
			await user.click(await screen.findByText('Save without sending'));
			await user.click(screen.getByRole('button', { name: 'Confirm' }));

			await waitFor(() => {
				expect(onSave).toHaveBeenCalledWith(
					expect.objectContaining({ draft: true, notifyAttendees: undefined })
				);
			});
		});
	});
});
