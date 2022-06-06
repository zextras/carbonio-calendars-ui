/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewEditor } from '../store/slices/editor-slice';
import { EditorCallbacks } from '../types/editor';
import { Store } from '../types/store/store';
import { useEditorCallbacks } from './use-editor-callbacks';
import { useIdentityItems } from './use-idenity-items';

let counter = 0;

const getNewEditId = (id: string): string => {
	counter += 1;
	return `${id}-${counter}`;
};

export const useEditor = (
	id: string
): { editorId: string | undefined; callbacks: EditorCallbacks } => {
	const [currentId, setCurrentId] = useState<string | undefined>(undefined);
	const editor = useSelector((store: Store) =>
		currentId ? store.editor.editors[currentId] : undefined
	);
	const callbacks = useEditorCallbacks(currentId);
	const identities = useIdentityItems();
	const dispatch = useDispatch();

	useEffect(() => {
		if (!editor) {
			const newId = getNewEditId(id);
			if (id === 'new') {
				dispatch(
					createNewEditor({
						id: newId,
						identities
					})
				);
			}
			setCurrentId(newId);
		}
	}, [identities, dispatch, id, editor]);

	return {
		editorId: currentId,
		callbacks
	};
};
