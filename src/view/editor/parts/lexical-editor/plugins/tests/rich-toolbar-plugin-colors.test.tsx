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

// `$generateHtmlFromNodes` builds real DOM elements and reads back their
// `style.cssText`, and jsdom's `CSSStyleDeclaration` normalizes any hex color
// it's given to `rgb(...)`, so hex input/preset colors surface in the
// exported HTML as the equivalent `rgb()` triplet rather than the hex string.
const RED_RGB = 'rgb(239, 83, 80)'; // #ef5350
const YELLOW_RGB = 'rgb(255, 193, 7)'; // #ffc107
const GREEN_RGB = 'rgb(0, 255, 0)'; // #00ff00

describe('RichToolbarPlugin - text and background color', () => {
	it('opens the text color popover and patches color from a preset swatch', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.text_color' }));
		expect(await screen.findByTestId('color-swatch-picker')).toBeInTheDocument();

		await user.click(screen.getByTestId('color-swatch-red'));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain(RED_RGB);
		});
	});

	it('closes the color popover once a swatch is picked', async () => {
		const { user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.text_color' }));
		await screen.findByTestId('color-swatch-picker');

		await user.click(screen.getByTestId('color-swatch-blue'));

		await waitFor(() => {
			expect(screen.queryByTestId('color-swatch-picker')).not.toBeInTheDocument();
		});
	});

	it('opens the background color popover and patches background-color from a preset swatch', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.background_color' }));
		await screen.findByTestId('color-swatch-picker');

		await user.click(screen.getByTestId('color-swatch-yellow'));

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain(`background-color: ${YELLOW_RGB}`);
		});
	});

	it('patches color by typing a hex value directly', async () => {
		const { editor, user } = await setupWithSelectedContent();

		await user.click(screen.getByRole('button', { name: 'lexical-label.text_color' }));
		const hexInput = await screen.findByTestId('color-swatch-picker-hex-input');

		await user.clear(hexInput);
		await user.type(hexInput, '00ff00');

		await waitFor(() => {
			expect(exportedHtml(editor)).toContain(GREEN_RGB);
		});
	});
});
