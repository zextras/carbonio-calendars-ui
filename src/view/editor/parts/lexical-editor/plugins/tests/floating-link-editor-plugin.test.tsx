/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';

import {
	createEditorStore,
	renderRichTextEditor,
	richTextOf
} from '../../tests/lexical-editor-test-utils';
import { screen, within } from '@test-setup';
import { Editor } from 'types/editor';
import { defaultEditor } from 'view/editor/tests/common';

const LINK_URL = 'https://custom-link.com';
const LINK_TEXT = 'lexical';
const EDITOR_TESTID = 'editor-composer';
const EDIT_LINK_LABEL = 'lexical-label.edit_link';
const REMOVE_LINK_LABEL = 'lexical-label.remove_link';
const SAVE_LABEL = 'label.save';

type TestUser = ReturnType<typeof renderRichTextEditor>['user'];

/** Renders the editor on the given content and returns the rendered link element. */
async function setupWithLink(
	richText = `<p>before <a href="${LINK_URL}">${LINK_TEXT}</a></p>`,
	overrides: Partial<Editor> = {}
): Promise<{
	store: ReturnType<typeof createEditorStore>;
	user: TestUser;
	link: HTMLElement;
}> {
	const store = createEditorStore({ richText, ...overrides });
	const { user } = renderRichTextEditor(store);
	const editorElement = screen.getByTestId(EDITOR_TESTID);
	const link = await within(editorElement).findByText(LINK_TEXT);
	return { store, user, link };
}

describe('FloatingLinkEditorPlugin', () => {
	it('does not show the floating editor until the link is hovered or pressed', async () => {
		const { user } = await setupWithLink();
		const editorElement = screen.getByTestId(EDITOR_TESTID);

		// Selecting the content (without touching the link) must not reveal the card.
		await user.click(editorElement);
		await user.keyboard('{Control>}a{/Control}');

		expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
	});

	it('shows the floating editor with the URL when the link is hovered', async () => {
		const { user, link } = await setupWithLink();

		await user.hover(link);

		expect(await screen.findByRole('link', { name: LINK_URL })).toHaveAttribute('href', LINK_URL);
		expect(screen.getByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: REMOVE_LINK_LABEL })).toBeInTheDocument();
	});

	it('keeps the card visible for a grace period after the pointer leaves the link', async () => {
		const { user, link } = await setupWithLink();

		await user.hover(link);
		await screen.findByRole('button', { name: EDIT_LINK_LABEL });

		await user.unhover(link);

		// Right after leaving the link the card is still there: hiding is delayed
		// so the pointer can travel from the link to the card.
		expect(screen.getByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();
		// Once the grace period expires without reaching the card, it hides.
		await waitFor(
			() => {
				expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
			},
			{ timeout: 2000 }
		);
	});

	it('does not hide the card while the pointer hovers the card itself', async () => {
		const { user, link } = await setupWithLink();

		await user.hover(link);
		const editButton = await screen.findByRole('button', { name: EDIT_LINK_LABEL });

		await user.unhover(link);
		await user.hover(editButton);

		// Wait well past the grace period: hovering the card cancels the hide.
		await new Promise((resolve) => {
			setTimeout(resolve, 800);
		});
		expect(screen.getByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();
	});

	it('keeps a pressed link pinned and dismisses it when pressing elsewhere', async () => {
		const { user, link } = await setupWithLink();

		await user.click(link);
		expect(await screen.findByRole('button', { name: EDIT_LINK_LABEL })).toBeInTheDocument();

		await user.click(screen.getByText('before'));

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
		});
	});

	it('does not show the floating editor when the description is read-only', async () => {
		const { user, link } = await setupWithLink(undefined, {
			disabled: { ...defaultEditor.disabled, composer: true }
		});

		await user.hover(link);

		expect(screen.queryByRole('button', { name: EDIT_LINK_LABEL })).not.toBeInTheDocument();
	});

	it('removes the link when the remove action is clicked', async () => {
		const { store, user, link } = await setupWithLink();

		await user.click(link);
		await user.click(await screen.findByRole('button', { name: REMOVE_LINK_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).not.toContain('<a');
		});
		// The text content is preserved after the link is removed.
		expect(richTextOf(store)).toContain(LINK_TEXT);
	});

	it('opens the edit modal pre-filled when the edit action is clicked', async () => {
		const { user, link } = await setupWithLink(
			`<p><a href="${LINK_URL}" target="_blank" title="My title">${LINK_TEXT}</a></p>`
		);

		await user.click(link);
		await user.click(await screen.findByRole('button', { name: EDIT_LINK_LABEL }));

		expect(await screen.findByText('lexical-label.insert_edit_link')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'lexical-label.url' })).toHaveValue(LINK_URL);
		expect(screen.getByRole('textbox', { name: 'lexical-label.text_to_display' })).toHaveValue(
			LINK_TEXT
		);
		expect(screen.getByRole('textbox', { name: 'lexical-label.link_title' })).toHaveValue(
			'My title'
		);
		expect(screen.getByText('lexical-label.new_window')).toBeInTheDocument();
	});

	it('updates the existing link in place when the edit modal is saved', async () => {
		const { store, user, link } = await setupWithLink();

		await user.click(link);
		await user.click(await screen.findByRole('button', { name: EDIT_LINK_LABEL }));
		await screen.findByText('lexical-label.insert_edit_link');

		const urlInput = screen.getByRole('textbox', { name: 'lexical-label.url' });
		await user.clear(urlInput);
		await user.paste('https://updated-link.com');
		const textInput = screen.getByRole('textbox', { name: 'lexical-label.text_to_display' });
		await user.clear(textInput);
		await user.paste('updated text');
		await user.pasteInto(
			screen.getByRole('textbox', { name: 'lexical-label.link_title' }),
			'Updated title'
		);
		await user.click(screen.getByText('lexical-label.current_window'));
		await user.click(
			within(screen.getByTestId('dropdown-popper-list')).getByText('lexical-label.new_window')
		);
		await user.click(screen.getByRole('button', { name: SAVE_LABEL }));

		await waitFor(() => {
			expect(richTextOf(store)).toContain('href="https://updated-link.com"');
		});
		const html = richTextOf(store);
		expect(html).toContain('updated text');
		expect(html).not.toContain(`>${LINK_TEXT}<`);
		expect(html).toContain('title="Updated title"');
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});
});
