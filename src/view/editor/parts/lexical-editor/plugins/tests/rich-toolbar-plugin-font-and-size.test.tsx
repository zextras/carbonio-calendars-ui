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

describe('RichToolbarPlugin - font family and size', () => {
	it('patches the font-family style on the selection', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.font);
		await user.click(await screen.findByText('Georgia'));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('georgia');
		});
	});

	it('patches the font-size style on the selection', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.size);
		await user.click(await screen.findByText('24pt'));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain('24pt');
		});
	});

	it('lists the full 16-value font-size range confirmed from the legacy TinyMCE config', async () => {
		const { user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.size);

		const expectedSizes = [
			'8pt',
			'9pt',
			'10pt',
			'11pt',
			'12pt',
			'13pt',
			'14pt',
			'16pt',
			'18pt',
			'24pt',
			'30pt',
			'36pt',
			'48pt',
			'60pt',
			'72pt',
			'96pt'
		];
		// The default-selected size's label is shown both by the closed trigger
		// and as a dropdown option, so there can be more than one match for it
		// once the dropdown is open.
		const matchesBySize = await Promise.all(
			expectedSizes.map((size) => screen.findAllByText(size))
		);
		matchesBySize.forEach((matches) => {
			expect(matches.length).toBeGreaterThan(0);
		});
	});

	it('lists the standard font families, including the default', async () => {
		const { user } = await setupWithSelectedContent();

		await openSelect(user, SELECT_INDEX.font);

		expect(await screen.findByText('Arial')).toBeInTheDocument();
		expect(screen.getByText('Tahoma')).toBeInTheDocument();
		expect(screen.getByText('Wingdings')).toBeInTheDocument();
	});

	it('seeds the font selects from the fontFamily/fontSize default props', async () => {
		await setupWithSelectedContent('hello world', {
			fontFamily: 'tahoma, arial, helvetica, sans-serif',
			fontSize: '18pt'
		});

		// The selects start closed; the trigger itself shows the selected item's
		// label, so this confirms the preferred-default props actually seeded
		// `selectedFont`/`selectedFontSize` rather than falling back to the
		// first list entry.
		expect(screen.getByText('Tahoma')).toBeInTheDocument();
		expect(screen.getByText('18pt')).toBeInTheDocument();
	});
});
