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
	editEditorLocation,
	editEditorTitle,
	setPendingCloseConfirmation,
	updateEditor
} from '../../../store/slices/editor-slice';
import { defaultEditor } from '../../editor/tests/common';
import { EditorCloseConfirmationModal } from '../editor-close-confirmation-modal';
import { setupHook, setupTest } from '@test-setup';

const YES_CLOSE_BTN = 'label.yes_close';
const CANCEL_BTN = 'label.cancel';
const CLOSE_ICON = 'icon: CloseOutline';
const CLEARS_PENDING = 'clears the pending close confirmation from state';

describe('EditorCloseConfirmationModal', () => {
	describe('when there is no pending close confirmation', () => {
		it('does not render any modal content', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<EditorCloseConfirmationModal />, { store });
			expect(screen.queryByText('label.close_appointment_editor')).not.toBeInTheDocument();
		});
	});

	const createTestStore = (): EnhancedStore<RootState> =>
		configureStore({ reducer: combineReducers(reducers) });

	describe('when there is a pending close confirmation', () => {
		let store: EnhancedStore<RootState>;

		beforeEach(() => {
			store = createTestStore();
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			store.dispatch(
				setPendingCloseConfirmation({ editorId: defaultEditor.id, boardTitle: 'Test appointment' })
			);
		});

		it('renders the modal title', () => {
			setupTest(<EditorCloseConfirmationModal />, { store });
			expect(screen.getByText('label.close_appointment_editor')).toBeInTheDocument();
		});

		it('renders the confirmation message', () => {
			setupTest(<EditorCloseConfirmationModal />, { store });
			expect(screen.getByText('message.close_appointment_editor_confirmation')).toBeInTheDocument();
		});

		it('renders the "Yes, close" button', () => {
			setupTest(<EditorCloseConfirmationModal />, { store });
			expect(screen.getByRole('button', { name: YES_CLOSE_BTN })).toBeInTheDocument();
		});

		it('renders the "Cancel" button', () => {
			setupTest(<EditorCloseConfirmationModal />, { store });
			expect(screen.getByRole('button', { name: CANCEL_BTN })).toBeInTheDocument();
		});

		it('renders the close icon button in the header', () => {
			setupTest(<EditorCloseConfirmationModal />, { store });
			expect(screen.getByTestId(CLOSE_ICON)).toBeInTheDocument();
		});

		describe('"Yes, close" button styling', () => {
			it('has primary background color', () => {
				setupTest(<EditorCloseConfirmationModal />, { store });
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: YES_CLOSE_BTN })).toHaveStyle(
					`background-color: ${result.current.palette.primary.regular}`
				);
			});

			it('has white (gray6) label color', () => {
				setupTest(<EditorCloseConfirmationModal />, { store });
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: YES_CLOSE_BTN })).toHaveStyle(
					`color: ${result.current.palette.gray6.regular}`
				);
			});
		});

		describe('"Cancel" button styling', () => {
			it('has primary label color', () => {
				setupTest(<EditorCloseConfirmationModal />, { store });
				const { result } = setupHook(useTheme);
				expect(screen.getByRole('button', { name: CANCEL_BTN })).toHaveStyle(
					`color: ${result.current.palette.primary.regular}`
				);
			});
		});

		describe('clicking "Yes, close"', () => {
			it(CLEARS_PENDING, async () => {
				const { user } = setupTest(<EditorCloseConfirmationModal />, { store });
				await user.click(screen.getByRole('button', { name: YES_CLOSE_BTN }));
				expect(store.getState().editor.pendingCloseConfirmation).toBeNull();
			});

			it('does not call addBoard', async () => {
				const { user } = setupTest(<EditorCloseConfirmationModal />, { store });
				await user.click(screen.getByRole('button', { name: YES_CLOSE_BTN }));
				expect(shell.addBoard).not.toHaveBeenCalled();
			});
		});

		describe('clicking "Cancel"', () => {
			it(CLEARS_PENDING, async () => {
				const { user } = setupTest(<EditorCloseConfirmationModal />, { store });
				await user.click(screen.getByRole('button', { name: CANCEL_BTN }));
				expect(store.getState().editor.pendingCloseConfirmation).toBeNull();
			});

			it('calls addBoard to reopen the board', async () => {
				const { user } = setupTest(<EditorCloseConfirmationModal />, { store });
				await user.click(screen.getByRole('button', { name: CANCEL_BTN }));
				expect(shell.addBoard).toHaveBeenCalledWith(
					expect.objectContaining({ boardViewId: CALENDAR_BOARD_ID })
				);
			});
		});

		describe('clicking the close icon (X) in header', () => {
			it(CLEARS_PENDING, async () => {
				const { user } = setupTest(<EditorCloseConfirmationModal />, { store });
				await user.click(screen.getByTestId(CLOSE_ICON));
				expect(store.getState().editor.pendingCloseConfirmation).toBeNull();
			});

			it('calls addBoard to reopen the board', async () => {
				const { user } = setupTest(<EditorCloseConfirmationModal />, { store });
				await user.click(screen.getByTestId(CLOSE_ICON));
				expect(shell.addBoard).toHaveBeenCalledWith(
					expect.objectContaining({ boardViewId: CALENDAR_BOARD_ID })
				);
			});
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
				editEditorLocation({ id: defaultEditor.id, location: defaultEditor.location })
			);
			expect(store.getState().editor.editors[defaultEditor.id]?.isDirty).toBe(false);
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
