/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore, type EnhancedStore } from '@reduxjs/toolkit';

import { RichTextEditorContainer } from '../rich-text-editor-container';
import { setupTest } from '@test-setup';
import { reducers, type RootState } from 'store/redux';
import { createNewEditor } from 'store/slices/editor-slice';
import { Editor } from 'types/editor';
import { defaultEditor } from 'view/editor/tests/common';

export function createEditorStore(overrides: Partial<Editor> = {}): EnhancedStore<RootState> {
	const store = configureStore({ reducer: combineReducers(reducers) });
	store.dispatch(createNewEditor({ ...defaultEditor, ...overrides }));
	return store;
}

export function richTextOf(
	store: EnhancedStore<RootState>,
	editorId: string = defaultEditor.id
): string {
	return store.getState().editor.editors[editorId]?.richText ?? '';
}

export function plainTextOf(
	store: EnhancedStore<RootState>,
	editorId: string = defaultEditor.id
): string {
	return store.getState().editor.editors[editorId]?.plainText ?? '';
}

export function renderRichTextEditor(
	store: EnhancedStore<RootState>,
	editorId: string = defaultEditor.id
): ReturnType<typeof setupTest> {
	return setupTest(<RichTextEditorContainer editorId={editorId} />, { store });
}
