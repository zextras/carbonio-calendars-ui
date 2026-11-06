/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';

import { defaultEditor } from './common';
import * as shell from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_BOARD_ID } from '../../../constants';
import { AppDispatch, reducers } from '../../../store/redux';
import { editEditorTitle, updateEditor } from '../../../store/slices/editor-slice';
import { Editor } from '../../../types/editor';
import BoardEditPanel from '../editor-board-wrapper';
import { setupTest } from '@test-setup';

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

	describe('content status', () => {
		const setupEditor = (dispatch: AppDispatch): Editor => {
			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			return generateEditor({ context: { folders: {}, dispatch, ...defaultEditor } });
		};

		it('notifies the shell that the board is pristine when the editor is clean', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupEditor(store.dispatch);
			const { setContentStatus } = shell.useBoardHooks();

			setupTest(<BoardEditPanel />, { store });

			expect(setContentStatus).toHaveBeenCalledWith('pristine');
			expect(setContentStatus).not.toHaveBeenCalledWith('dirty');
		});

		it('notifies the shell that the board is dirty when the editor has unsaved changes', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupEditor(store.dispatch);
			const { setContentStatus } = shell.useBoardHooks();
			store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'Changed title' }));

			setupTest(<BoardEditPanel />, { store });

			expect(setContentStatus).toHaveBeenLastCalledWith('dirty');
		});

		it('notifies the shell when the editor becomes dirty after the first render', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupEditor(store.dispatch);
			const { setContentStatus } = shell.useBoardHooks();
			setupTest(<BoardEditPanel />, { store });
			expect(setContentStatus).toHaveBeenLastCalledWith('pristine');

			act(() => {
				store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'Changed title' }));
			});

			expect(setContentStatus).toHaveBeenLastCalledWith('dirty');
		});

		it('notifies the shell that the board is pristine again after a successful save', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = setupEditor(store.dispatch);
			const { setContentStatus } = shell.useBoardHooks();
			setupTest(<BoardEditPanel />, { store });
			act(() => {
				store.dispatch(editEditorTitle({ id: defaultEditor.id, title: 'Changed title' }));
			});
			expect(setContentStatus).toHaveBeenLastCalledWith('dirty');

			act(() => {
				store.dispatch(
					updateEditor({ id: defaultEditor.id, editor: { ...editor, title: 'Changed title' } })
				);
			});

			expect(setContentStatus).toHaveBeenLastCalledWith('pristine');
		});

		it('does not crash when the shell does not provide setContentStatus', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupEditor(store.dispatch);
			const hooks = shell.useBoardHooks();
			shell.useBoardHooks.mockReturnValueOnce({ ...hooks, setContentStatus: undefined });

			setupTest(<BoardEditPanel />, { store });

			expect(await screen.findByTestId('EditorPanel')).toBeInTheDocument();
		});
	});
});
