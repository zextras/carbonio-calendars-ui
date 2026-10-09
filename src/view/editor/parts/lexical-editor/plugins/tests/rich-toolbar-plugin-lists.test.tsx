/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';

import {
	exportedHtml,
	installRangeRectPolyfill,
	setupWithSelectedContent
} from './rich-toolbar-plugin-test-utils';
import { screen } from '@test-setup';

beforeAll(() => {
	installRangeRectPolyfill();
});

describe('RichToolbarPlugin - lists', () => {
	it('wraps the selection in a bulleted list', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.bullet_list' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<ul');
		});
		expect(exportedHtml(editor)).toContain('<li');
	});

	it('wraps the selection in a numbered list', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.numbered_list' }));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<ol');
		});
		expect(exportedHtml(editor)).toContain('<li');
	});

	it('marks the bulleted-list button as active once applied', async () => {
		const { user } = await setupWithSelectedContent();

		const bulletButton = screen.getByRole('button', { name: 'lexical-label.bullet_list' });
		await user.click(bulletButton);

		await waitFor(() => {
			expect(bulletButton).toHaveAttribute('aria-pressed', 'true');
		});
	});

	it('marks the numbered-list button as active once applied', async () => {
		const { user } = await setupWithSelectedContent();

		const numberButton = screen.getByRole('button', { name: 'lexical-label.numbered_list' });
		await user.click(numberButton);

		await waitFor(() => {
			expect(numberButton).toHaveAttribute('aria-pressed', 'true');
		});
	});

	it('switches a bulleted list to a numbered list', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.bullet_list' }));
		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<ul');
		});

		await user.click(screen.getByRole('button', { name: 'lexical-label.numbered_list' }));
		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<ol');
		});
		expect(exportedHtml(editor)).not.toContain('<ul');
	});
});
