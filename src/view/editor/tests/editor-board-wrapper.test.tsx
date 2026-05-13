/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';

import { defaultEditor } from './common';
import * as shell from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_BOARD_ID } from '../../../constants';
import { reducers } from '../../../store/redux';
import { editEditorTitle, updateEditor } from '../../../store/slices/editor-slice';
import { Editor } from '../../../types/editor';
import BoardEditPanel from '../editor-board-wrapper';
import { setupTest } from '@test-setup';

const mockCreateModal = vi.fn();
const mockCloseModal = vi.fn();

vi.mock('../../global-modal-manager', () => ({
	useGlobalModal: vi.fn(() => ({ createModal: mockCreateModal, closeModal: mockCloseModal }))
}));

const initBoard = ({
	editorId,
	isNew
}: {
	editorId: string;
	isNew: boolean;
}): Board & { editor: Editor } => ({
	boardViewId: CALENDAR_BOARD_ID,
	title: 'Nuovo appuntamento',
	id: editorId,
	app: 'carbonio-calendars-ui',
	icon: 'CalendarModOutline',
	editor: { ...defaultEditor, id: editorId, isNew }
});

describe('Editor board wrapper', () => {
	describe('rendering', () => {
		it('it does not render without board id', async () => {
			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			setupTest(<BoardEditPanel />, { store });
			expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
		});

		it('it renders with board id', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			generateEditor({
				context: {
					folders: {},
					dispatch: store.dispatch,
					...defaultEditor
				}
			});
			setupTest(<BoardEditPanel />, { store });

			expect(await screen.findByTestId('EditorPanel')).toBeInTheDocument();
		});
	});

	describe('close confirmation', () => {
		it('calls updateBoard with an onClose handler when mounted', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const mockBoardHooks = shell.useBoardHooks();

			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});

			setupTest(<BoardEditPanel />, { store });

			expect(mockBoardHooks.updateBoard).toHaveBeenCalledWith(
				expect.objectContaining({ onClose: expect.any(Function) })
			);
		});

		it('opens close confirmation modal when onClose fires with dirty editor', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const mockBoardHooks = shell.useBoardHooks();

			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});

			// Mark the editor as dirty
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'Changed title' }));

			setupTest(<BoardEditPanel />, { store });

			// Simulate the board X button click by calling onClose
			const updateBoardCalls = mockBoardHooks.updateBoard.mock.calls;
			const lastCall = updateBoardCalls[updateBoardCalls.length - 1];
			const { onClose } = lastCall[0];
			onClose();

			expect(mockCreateModal).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'editor-close-confirmation' }),
				true
			);
		});

		it('calls closeModal when the modal outer onClose is triggered', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const mockBoardHooks = shell.useBoardHooks();

			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'Changed title' }));

			setupTest(<BoardEditPanel />, { store });

			const updateBoardCalls = mockBoardHooks.updateBoard.mock.calls;
			const { onClose } = updateBoardCalls[updateBoardCalls.length - 1][0];
			onClose();

			const modalArgs = mockCreateModal.mock.calls[0][0];
			modalArgs.onClose();

			expect(mockCloseModal).toHaveBeenCalledWith('editor-close-confirmation');
		});

		it('does not open close confirmation modal when onClose fires with clean editor', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const mockBoardHooks = shell.useBoardHooks();

			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});

			setupTest(<BoardEditPanel />, { store });

			// Simulate the board X button click without editing
			const updateBoardCalls = mockBoardHooks.updateBoard.mock.calls;
			const lastCall = updateBoardCalls[updateBoardCalls.length - 1];
			const { onClose } = lastCall[0];
			onClose();

			expect(mockCreateModal).not.toHaveBeenCalled();
		});

		it('does not open close confirmation modal when onClose fires after a successful save', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const mockBoardHooks = shell.useBoardHooks();

			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			const editor = generateEditor({
				context: { folders: {}, dispatch: store.dispatch, ...defaultEditor }
			});

			// Make dirty, then simulate a successful save (isDirty resets to false)
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'Changed title' }));
			store.dispatch(
				updateEditor({ id: defaultEditor.id, editor: { ...editor, title: 'Changed title' } })
			);

			setupTest(<BoardEditPanel />, { store });

			const updateBoardCalls = mockBoardHooks.updateBoard.mock.calls;
			const lastCall = updateBoardCalls[updateBoardCalls.length - 1];
			const { onClose } = lastCall[0];
			onClose();

			expect(mockCreateModal).not.toHaveBeenCalled();
		});
	});
});
