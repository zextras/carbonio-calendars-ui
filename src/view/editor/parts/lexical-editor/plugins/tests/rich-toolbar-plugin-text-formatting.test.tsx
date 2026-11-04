/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';

import {
	exportedHtml,
	installRangeRectPolyfill,
	openSelect,
	SELECT_INDEX,
	setupWithSelectedContent
} from './rich-toolbar-plugin-test-utils';
import { screen } from '@test-setup';

beforeAll(() => {
	installRangeRectPolyfill();
});

// With no `theme.text.*` classes configured on this test-only composer (the
// production `RichTextEditorContainer` does configure them — see its
// `cal-lexical-bold`/etc. theme keys), `$generateHtmlFromNodes` falls back to
// Lexical's built-in per-format wrapper tags instead of inline styles/classes:
// bold -> `<b>`, italic -> `<i>`, underline -> `<u>`, strikethrough -> `<s>`.
describe('RichToolbarPlugin - inline text formatting', () => {
	it('applies bold to the selection', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.bold' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<b>');
		});
	});

	it('applies italic to the selection', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.italic' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<i>');
		});
	});

	it('applies underline to the selection', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.underline' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<u>');
		});
	});

	it('applies strikethrough to the selection', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.strikethrough' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<s>');
		});
	});

	it('marks the bold/italic/underline/strikethrough buttons as active once applied', async () => {
		const { user } = await setupWithSelectedContent();

		const boldButton = screen.getByRole('button', { name: 'lexical-label.bold' });
		await user.click(boldButton);

		await waitFor(() => {
			expect(boldButton).toHaveAttribute('aria-pressed', 'true');
		});
	});

	it('clears an applied font-family style with the remove-formatting control', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.font);
		await user.click(await screen.findByText('Tahoma'));
		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('tahoma');
		});

		await user.click(screen.getByTestId('toolbar-test-editor'));
		await user.keyboard('{Control>}a{/Control}');
		await user.click(screen.getByRole('button', { name: 'lexical-label.remove_format' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).not.toContain('tahoma');
		});
	});

	it('clears active bold/italic/underline/strikethrough with the remove-formatting control', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.bold' }));
		await user.click(screen.getByRole('button', { name: 'lexical-label.italic' }));
		await user.click(screen.getByRole('button', { name: 'lexical-label.underline' }));
		await user.click(screen.getByRole('button', { name: 'lexical-label.strikethrough' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<s>');
		});
		const formattedHtml = exportedHtml(editor);
		expect(formattedHtml).toContain('<b>');
		expect(formattedHtml).toContain('<i>');
		expect(formattedHtml).toContain('<u>');

		await user.click(screen.getByTestId('toolbar-test-editor'));
		await user.keyboard('{Control>}a{/Control}');
		await user.click(screen.getByRole('button', { name: 'lexical-label.remove_format' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).not.toContain('<s>');
		});
		const clearedHtml = exportedHtml(editor);
		expect(clearedHtml).not.toContain('<b>');
		expect(clearedHtml).not.toContain('<i>');
		expect(clearedHtml).not.toContain('<u>');
	});
});
