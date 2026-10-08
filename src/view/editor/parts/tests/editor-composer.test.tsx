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
import { Editor } from 'types/editor';
import { defaultEditor } from 'view/editor/tests/common';

import { EditorComposer } from '../editor-composer';

function createStore(overrides: Partial<Editor> = {}): EnhancedStore<RootState> {
	const store = configureStore({ reducer: combineReducers(reducers) });
	store.dispatch(createNewEditor({ ...defaultEditor, ...overrides }));
	return store;
}

describe('EditorComposer', () => {
	it('mounts the Lexical rich-text editor when isRichText is true', async () => {
		const store = createStore({ isRichText: true, richText: '<p>Hello</p>' });
		setupTest(<EditorComposer editorId={defaultEditor.id} />, { store });

		expect(await screen.findByTestId('editor-composer')).toBeInTheDocument();
		expect(screen.queryByTestId('editor-textArea')).not.toBeInTheDocument();
	});

	it('mounts the plain textarea when isRichText is false', () => {
		const store = createStore({ isRichText: false, plainText: 'Hello' });
		setupTest(<EditorComposer editorId={defaultEditor.id} />, { store });

		expect(screen.getByTestId('editor-textArea')).toBeInTheDocument();
		expect(screen.queryByTestId('editor-composer')).not.toBeInTheDocument();
	});

	it('disables the plain textarea when disabled.composer is set', () => {
		const store = createStore({
			isRichText: false,
			plainText: 'Hello',
			disabled: { ...defaultEditor.disabled, composer: true }
		});
		setupTest(<EditorComposer editorId={defaultEditor.id} />, { store });

		expect(screen.getByTestId('editor-textArea')).toBeDisabled();
	});

	it('makes the rich-text editor non-editable when disabled.composer is set', async () => {
		const store = createStore({
			isRichText: true,
			richText: '<p>Hello</p>',
			disabled: { ...defaultEditor.disabled, composer: true }
		});
		setupTest(<EditorComposer editorId={defaultEditor.id} />, { store });

		const editorElement = await screen.findByTestId('editor-composer');
		expect(editorElement).toHaveAttribute('contenteditable', 'false');
	});
});
