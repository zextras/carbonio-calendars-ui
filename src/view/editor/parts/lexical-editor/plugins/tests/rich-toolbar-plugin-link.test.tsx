/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act, waitFor } from '@testing-library/react';
import { $createParagraphNode, $createTextNode, $getRoot, type LexicalEditor } from 'lexical';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';

const EDITOR_TESTID = 'editor-composer';
const SELECTED_TEXT = 'hello world';
const LINK_LABEL = 'lexical-label.insert_link';
const URL_LABEL = 'lexical-label.url';
const SAVE_LABEL = 'label.save';
const EXAMPLE_URL = 'https://example.com';

async function setupWithSelectedContent(): Promise<{
	store: ReturnType<typeof createEditorStore>;
	editorElement: HTMLElement;
	user: ReturnType<typeof renderRichTextEditor>['user'];
}> {
	const store = createEditorStore({ richText: '<p><br></p>' });
	const { user } = renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID) as HTMLElement & {
		__lexicalEditor: LexicalEditor;
	};
	const editor = editorElement.__lexicalEditor;

	act(() => {
		editor.update(() => {
			const root = $getRoot();
			root.clear();
			const paragraph = $createParagraphNode();
			paragraph.append($createTextNode(SELECTED_TEXT));
			root.append(paragraph);
		});
	});
	await screen.findByText(SELECTED_TEXT);

	await user.click(editorElement);
	await user.keyboard('{Control>}a{/Control}');

	return { store, editorElement, user };
}

describe('RichToolbarPlugin - link', () => {
	it('inserts a link from the modal for the typed URL', async () => {
		const { store, editorElement, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: LINK_LABEL }));

		expect(await screen.findByText('lexical-label.insert_edit_link')).toBeInTheDocument();
		await user.pasteInto(screen.getByRole('textbox', { name: URL_LABEL }), EXAMPLE_URL);
		await user.click(screen.getByRole('button', { name: SAVE_LABEL }));

		expect(await within(editorElement).findByRole('link')).toBeInTheDocument();
		await waitFor(() => {
			expect(richTextOf(store)).toContain(`href="${EXAMPLE_URL}"`);
		});
	});

	it('pre-fills the text to display with the current selection', async () => {
		const { user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: LINK_LABEL }));

		expect(
			await screen.findByRole('textbox', { name: 'lexical-label.text_to_display' })
		).toHaveValue(SELECTED_TEXT);
	});

	it('opens a new link in a new window by default', async () => {
		const { store, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: LINK_LABEL }));
		await user.pasteInto(screen.getByRole('textbox', { name: URL_LABEL }), EXAMPLE_URL);

		expect(screen.getByText('lexical-label.new_window')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: SAVE_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain('target="_blank"');
		});
		expect(richTextOf(store)).toContain('rel="noopener noreferrer"');
	});

	it('opens the link in the current window when selected', async () => {
		const { store, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: LINK_LABEL }));
		await user.pasteInto(screen.getByRole('textbox', { name: URL_LABEL }), EXAMPLE_URL);

		await user.click(screen.getByText('lexical-label.new_window'));
		await user.click(
			within(screen.getByTestId('dropdown-popper-list')).getByText('lexical-label.current_window')
		);
		await user.click(screen.getByRole('button', { name: SAVE_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain(`href="${EXAMPLE_URL}"`);
		});
		expect(richTextOf(store)).not.toContain('target="_blank"');
	});
});
