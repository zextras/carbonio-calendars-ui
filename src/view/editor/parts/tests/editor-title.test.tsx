/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore, type EnhancedStore } from '@reduxjs/toolkit';

import { setupTest, screen } from '@test-setup';
import { reducers, type RootState } from 'store/redux';
import { createNewEditor } from 'store/slices/editor-slice';
import { defaultEditor } from 'view/editor/tests/common';

import { EditorTitle } from '../editor-title';

function createStore(): EnhancedStore<RootState> {
	const store = configureStore({ reducer: combineReducers(reducers) });
	store.dispatch(createNewEditor(defaultEditor));
	return store;
}

describe('EditorTitle', () => {
	it('opts the title input out of the shell context menu blocker', () => {
		setupTest(<EditorTitle editorId={defaultEditor.id} />, { store: createStore() });

		const input = screen.getByRole('textbox', { name: /event title/i });
		// eslint-disable-next-line testing-library/no-node-access
		expect(input.closest('.carbonio-bypass-context-menu')).toBeInTheDocument();
	});
});
