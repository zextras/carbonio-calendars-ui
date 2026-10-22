/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable testing-library/prefer-user-event -- pointer drags with explicit coordinates and a raw dragstart have no user-event equivalent */
import { act, fireEvent, waitFor } from '@testing-library/react';
import { KEY_DELETE_COMMAND, type LexicalEditor } from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const IMAGE_HTML = '<p><img src="https://example.com/inline.png" alt="pic" /></p>';
const RESIZE_HANDLE_TESTID = 'image-resizer-se';

type TestUser = ReturnType<typeof renderRichTextEditor>['user'];

async function setupWithImage(): Promise<{
	store: ReturnType<typeof createEditorStore>;
	user: TestUser;
	image: HTMLElement;
	editor: LexicalEditor;
}> {
	const store = createEditorStore({ richText: IMAGE_HTML });
	const { user } = renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID);
	const image = await within(editorElement).findByRole('img');
	const editor = (editorElement as HTMLElement & { __lexicalEditor: LexicalEditor })
		.__lexicalEditor;
	return { store, user, image, editor };
}

describe('ImageComponent', () => {
	it('commits the new size to the document when a resize handle is released', async () => {
		vi.spyOn(HTMLImageElement.prototype, 'getBoundingClientRect').mockReturnValue({
			width: 100,
			height: 50
		} as DOMRect);
		const { store, user, image } = await setupWithImage();

		await user.click(image);
		const handle = await screen.findByTestId(RESIZE_HANDLE_TESTID);

		fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
		fireEvent.mouseUp(document, { clientX: 20, clientY: 10 });

		await waitFor(() => {
			expect(richTextOf(store)).toContain('width: 120px');
		});
		expect(richTextOf(store)).toContain('height: 60px');
	});

	it('toggles the selection when the image is shift-clicked', async () => {
		const { user, image } = await setupWithImage();

		await user.click(image);
		expect(await screen.findByTestId(RESIZE_HANDLE_TESTID)).toBeInTheDocument();

		await user.keyboard('{Shift>}');
		await user.click(image);
		await user.keyboard('{/Shift}');

		await waitFor(() => {
			expect(screen.queryByTestId(RESIZE_HANDLE_TESTID)).not.toBeInTheDocument();
		});
	});

	it('prevents the native drag of the image', async () => {
		const { image } = await setupWithImage();

		// fireEvent returns false when a handler called preventDefault().
		expect(fireEvent.dragStart(image)).toBe(false);
	});

	it('does not remove the image on Delete when it is not selected', async () => {
		const { image, editor } = await setupWithImage();

		act(() => {
			editor.dispatchCommand(KEY_DELETE_COMMAND, new KeyboardEvent('keydown', { key: 'Delete' }));
		});

		expect(image).toBeInTheDocument();
	});
});
