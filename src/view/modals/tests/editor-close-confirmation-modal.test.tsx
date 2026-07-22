/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';

import * as shell from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_BOARD_ID } from '../../../constants';
import { reducers, type RootState } from '../../../store/redux';
import {
	editEditorAllDay,
	editEditorAttendees,
	editEditorCalendar,
	editEditorClass,
	editEditorDisplayStatus,
	editEditorLocation,
	editEditorReminder,
	editEditorText,
	editEditorTimezone,
	editEditorTitle,
	editSender,
	updateEditor
} from '../../../store/slices/editor-slice';
import { defaultEditor } from '../../editor/tests/common';
import { EditorCloseConfirmationModal } from '../editor-close-confirmation-modal';
import { setupHook, setupTest } from '@test-setup';

const DISCARD_CHANGES_BTN = 'label.discard_changes';
const KEEP_EDITING_BTN = 'label.keep_editing';
const CLOSE_ICON = 'icon: CloseOutline';

describe('EditorCloseConfirmationModal', () => {
	const createTestStore = (): EnhancedStore<RootState> =>
		configureStore({ reducer: combineReducers(reducers) });

	const renderModal = (
		store: EnhancedStore<RootState>,
		onClose = vi.fn(),
		boardTitle = 'Test appointment'
	): ReturnType<typeof setupTest> =>
		setupTest(
			<EditorCloseConfirmationModal
				editorId={defaultEditor.id}
				boardTitle={boardTitle}
				onClose={onClose}
			/>,
			{ store }
		);

	describe('rendering', () => {
		let store: EnhancedStore<RootState>;

		beforeEach(() => {
			store = createTestStore();
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
		});

		it('renders the modal title', () => {
			renderModal(store);
			expect(screen.getByText('label.close_appointment_editor')).toBeInTheDocument();
		});

		it('renders the confirmation message', () => {
			renderModal(store);
			expect(screen.getByText('message.close_appointment_editor_confirmation')).toBeInTheDocument();
		});

		it('renders the "Discard changes" button', () => {
			renderModal(store);
			expect(screen.getByRole('button', { name: DISCARD_CHANGES_BTN })).toBeInTheDocument();
		});

		it('renders the "Keep editing" button', () => {
			renderModal(store);
			expect(screen.getByRole('button', { name: KEEP_EDITING_BTN })).toBeInTheDocument();
		});

		it('renders the close icon button in the header', () => {
			renderModal(store);
			expect(screen.getByTestId(CLOSE_ICON)).toBeInTheDocument();
		});

		it('does not render a "Save and close" button', () => {
			renderModal(store);
			expect(
				screen.queryByRole('button', { name: 'label.save_and_close' })
			).not.toBeInTheDocument();
		});

		describe('"Discard changes" button styling', () => {
			it('has primary background color', () => {
				renderModal(store);
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: DISCARD_CHANGES_BTN })).toHaveStyle(
					`background-color: ${result.current.palette.primary.regular}`
				);
			});

			it('has white (gray6) label color', () => {
				renderModal(store);
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: DISCARD_CHANGES_BTN })).toHaveStyle(
					`color: ${result.current.palette.gray6.regular}`
				);
			});
		});

		describe('"Keep editing" button styling', () => {
			it('has primary label color', () => {
				renderModal(store);
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: KEEP_EDITING_BTN })).toHaveStyle(
					`color: ${result.current.palette.primary.regular}`
				);
			});
		});
	});

	describe('clicking "Discard changes"', () => {
		let store: EnhancedStore<RootState>;

		beforeEach(() => {
			store = createTestStore();
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
		});

		it('calls onClose', async () => {
			const mockOnClose = vi.fn();
			const { user } = renderModal(store, mockOnClose);
			await user.click(screen.getByRole('button', { name: DISCARD_CHANGES_BTN }));
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('does not call addBoard', async () => {
			const { user } = renderModal(store);
			await user.click(screen.getByRole('button', { name: DISCARD_CHANGES_BTN }));
			expect(shell.addBoard).not.toHaveBeenCalled();
		});
	});

	describe('clicking "Keep editing"', () => {
		let store: EnhancedStore<RootState>;

		beforeEach(() => {
			store = createTestStore();
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
		});

		it('calls onClose', async () => {
			const mockOnClose = vi.fn();
			const { user } = renderModal(store, mockOnClose);
			await user.click(screen.getByRole('button', { name: KEEP_EDITING_BTN }));
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('calls addBoard to reopen the board', async () => {
			const { user } = renderModal(store);
			await user.click(screen.getByRole('button', { name: KEEP_EDITING_BTN }));
			expect(shell.addBoard).toHaveBeenCalledWith(
				expect.objectContaining({ boardViewId: CALENDAR_BOARD_ID })
			);
		});

		it('falls back to editor title when boardTitle is empty', async () => {
			const { user } = renderModal(store, vi.fn(), '');
			await user.click(screen.getByRole('button', { name: KEEP_EDITING_BTN }));
			expect(shell.addBoard).toHaveBeenCalledWith(
				expect.objectContaining({ title: defaultEditor.title })
			);
		});

		it('falls back to empty string when boardTitle and editor title are both empty', async () => {
			const emptyTitleStore = createTestStore();
			generateEditor({
				context: { folders: {}, dispatch: emptyTitleStore.dispatch, ...defaultEditor, title: '' }
			});
			const { user } = setupTest(
				<EditorCloseConfirmationModal
					editorId={defaultEditor.id}
					boardTitle=""
					onClose={vi.fn()}
				/>,
				{ store: emptyTitleStore }
			);
			await user.click(screen.getByRole('button', { name: KEEP_EDITING_BTN }));
			expect(shell.addBoard).toHaveBeenCalledWith(expect.objectContaining({ title: '' }));
		});

		it('calls onClose but not addBoard when editor is not found in store', async () => {
			const emptyStore = createTestStore();
			const mockOnClose = vi.fn();
			const { user } = setupTest(
				<EditorCloseConfirmationModal
					editorId="non-existent"
					boardTitle="Test"
					onClose={mockOnClose}
				/>,
				{ store: emptyStore }
			);
			await user.click(screen.getByRole('button', { name: KEEP_EDITING_BTN }));
			expect(shell.addBoard).not.toHaveBeenCalled();
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe('clicking the close icon (X) in header', () => {
		let store: EnhancedStore<RootState>;

		beforeEach(() => {
			store = createTestStore();
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
		});

		it('calls onClose', async () => {
			const mockOnClose = vi.fn();
			const { user } = renderModal(store, mockOnClose);
			await user.click(screen.getByTestId(CLOSE_ICON));
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('behaves like "Keep editing": calls addBoard to reopen the board', async () => {
			const { user } = renderModal(store);
			await user.click(screen.getByTestId(CLOSE_ICON));
			expect(shell.addBoard).toHaveBeenCalledWith(
				expect.objectContaining({ boardViewId: CALENDAR_BOARD_ID })
			);
		});
	});

	describe('isDirty tracking', () => {
		it('starts as false when editor is created', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);
		});

		it('becomes true when a field is edited', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'New title' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('resets to false when the only changed field is reverted to its original value', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'New title' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);

			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: defaultEditor.title ?? '' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);
		});

		it('stays true when one field is reverted but another still differs', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'New title' }));
			store.dispatch(editEditorLocation({ id: defaultEditor.id, location: 'Rome' }));

			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: defaultEditor.title ?? '' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('resets to false only when all changed fields are reverted', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'New title' }));
			store.dispatch(editEditorLocation({ id: defaultEditor.id, location: 'Rome' }));

			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: defaultEditor.title ?? '' }));
			store.dispatch(
				editEditorLocation({ id: defaultEditor.id, location: defaultEditor.location ?? '' })
			);
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);
		});

		describe('attendees comparison', () => {
			it('is not dirty when attendees are dispatched with same emails but different object shape', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				const fullAttendees = [
					{
						email: 'alice@example.com',
						fullName: 'Alice Smith',
						label: 'Alice Smith',
						ptst: 'AC' as const
					}
				];
				generateEditor({
					context: {
						folders: {},
						dispatch: store.dispatch,
						...defaultEditor,
						attendees: fullAttendees
					}
				});

				// Simulate ContactInput's onChange returning stripped-down attendee objects
				store.dispatch(
					editEditorAttendees({
						id: defaultEditor.id,
						attendees: [{ email: 'alice@example.com', label: 'Alice Smith' }]
					})
				);

				expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);
			});

			it('is not dirty when attendees are dispatched with same emails but different casing', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				generateEditor({
					context: {
						folders: {},
						dispatch: store.dispatch,
						...defaultEditor,
						attendees: [{ email: 'Alice@Example.com', label: 'Alice Smith' }]
					}
				});

				store.dispatch(
					editEditorAttendees({
						id: defaultEditor.id,
						attendees: [{ email: 'alice@example.com', label: 'Alice Smith' }]
					})
				);

				expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);
			});

			it('is dirty when an attendee is added', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				generateEditor({
					context: {
						folders: {},
						dispatch: store.dispatch,
						...defaultEditor,
						attendees: [{ email: 'alice@example.com', label: 'Alice' }]
					}
				});

				store.dispatch(
					editEditorAttendees({
						id: defaultEditor.id,
						attendees: [
							{ email: 'alice@example.com', label: 'Alice' },
							{ email: 'bob@example.com', label: 'Bob' }
						]
					})
				);

				expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
			});

			it('is dirty when an attendee is removed', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				generateEditor({
					context: {
						folders: {},
						dispatch: store.dispatch,
						...defaultEditor,
						attendees: [
							{ email: 'alice@example.com', label: 'Alice' },
							{ email: 'bob@example.com', label: 'Bob' }
						]
					}
				});

				store.dispatch(
					editEditorAttendees({
						id: defaultEditor.id,
						attendees: [{ email: 'alice@example.com', label: 'Alice' }]
					})
				);

				expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
			});
		});

		it('becomes true when allDay is toggled', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(editEditorAllDay({ id: defaultEditor.id, allDay: !defaultEditor.allDay }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('becomes true when timezone is changed', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(editEditorTimezone({ id: defaultEditor.id, timezone: 'America/New_York' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('becomes true when reminder is changed', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(editEditorReminder({ id: defaultEditor.id, reminder: '10' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('becomes true when freeBusy status is changed', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(editEditorDisplayStatus({ id: defaultEditor.id, freeBusy: 'F' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('becomes true when calendar is changed', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(
				editEditorCalendar({ id: defaultEditor.id, calendar: { id: '99', name: 'Other' } })
			);
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('becomes true when class is changed', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(editEditorClass({ id: defaultEditor.id, class: 'PRI' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('becomes true when rich text is changed', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(
				editEditorText({ id: defaultEditor.id, richText: '<p>new</p>', plainText: 'new' })
			);
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('becomes true when sender is changed', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			generateEditor({ context: { folders: {}, dispatch: store.dispatch, ...defaultEditor } });
			store.dispatch(
				editSender({ id: defaultEditor.id, sender: { email: 'new@test.com', fullName: 'New' } })
			);
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);
		});

		it('uses the saved state as the new baseline after updateEditor', () => {
			const savedTitle = 'Saved title';
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: savedTitle }));
			store.dispatch(
				updateEditor({ id: defaultEditor.id, editor: { ...editor, title: savedTitle } })
			);
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);

			// Reverting to the pre-save title should now be treated as a change
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: defaultEditor.title ?? '' }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(true);

			// Going back to the saved title clears isDirty
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: savedTitle }));
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);
		});
	});
});
