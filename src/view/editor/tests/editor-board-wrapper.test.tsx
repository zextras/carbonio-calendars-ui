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
});
