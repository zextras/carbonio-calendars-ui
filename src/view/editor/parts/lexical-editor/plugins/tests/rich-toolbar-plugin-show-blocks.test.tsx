/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createEditorStore, renderRichTextEditor } from '../../tests/lexical-editor-test-utils';
import { screen } from '@test-setup';

describe('RichToolbarPlugin - show blocks', () => {
	it('renders the show blocks toggle inactive by default', () => {
		const store = createEditorStore({ richText: '<p>Hello</p>' });
		renderRichTextEditor(store);

		expect(
			screen.getByRole('button', { name: 'lexical-label.show_blocks', pressed: false })
		).toBeInTheDocument();
		expect(document.querySelector('.cal-lexical-show-blocks')).not.toBeInTheDocument();
	});

	it('toggles the block outlines view aid on and off', async () => {
		const store = createEditorStore({ richText: '<p>Hello</p>' });
		const { user } = renderRichTextEditor(store);
		const button = screen.getByRole('button', { name: 'lexical-label.show_blocks' });

		await user.click(button);

		expect(
			await screen.findByRole('button', { name: 'lexical-label.show_blocks', pressed: true })
		).toBeInTheDocument();
		expect(document.querySelector('.cal-lexical-show-blocks')).toBeInTheDocument();

		await user.click(button);

		expect(
			await screen.findByRole('button', { name: 'lexical-label.show_blocks', pressed: false })
		).toBeInTheDocument();
		expect(document.querySelector('.cal-lexical-show-blocks')).not.toBeInTheDocument();
	});
});
