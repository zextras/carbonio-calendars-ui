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

// `t()` is mocked repo-wide to return the translation key itself (see
// `__mocks__/@zextras/carbonio-shell-ui.tsx`), not the English fallback, so
// the select's option labels render as these keys in tests.
const HEADING_1_LABEL = 'lexical-label.heading_1';
const HEADING_2_LABEL = 'lexical-label.heading_2';
const HEADING_6_LABEL = 'lexical-label.heading_6';
const BLOCKQUOTE_LABEL = 'lexical-label.blockquote';
const PARAGRAPH_LABEL = 'lexical-label.paragraph';

describe('RichToolbarPlugin - block type', () => {
	it('turns the paragraph into a Heading 1', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.paragraph);
		await user.click(await screen.findByText(HEADING_1_LABEL));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<h1');
		});
	});

	it('turns the paragraph into a Heading 6', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.paragraph);
		await user.click(await screen.findByText(HEADING_6_LABEL));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<h6');
		});
	});

	it('turns the paragraph into a Blockquote', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.paragraph);
		await user.click(await screen.findByText(BLOCKQUOTE_LABEL));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<blockquote');
		});
	});

	it('turns a heading back into a plain paragraph', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.paragraph);
		await user.click(await screen.findByText(HEADING_2_LABEL));
		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('<h2');
		});

		await user.click(screen.getByTestId('toolbar-test-editor'));
		await user.keyboard('{Control>}a{/Control}');
		await openSelect(user, SELECT_INDEX.paragraph);
		await user.click(await screen.findByText(PARAGRAPH_LABEL));

		await waitFor(() => {
			expect(exportedHtml(editor)).not.toContain('<h2');
		});
		expect(exportedHtml(editor)).toContain('<p');
	});
});
