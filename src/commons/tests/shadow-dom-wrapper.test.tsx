/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import '@testing-library/jest-dom';

import { render, screen, waitFor } from '@testing-library/react';
import { enable as enableDarkReader } from 'darkreader';
import { Mock } from 'vitest';

import { ShadowDomWrapper } from '../shadow-dom-wrapper';
import { useUserSettings } from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';

vi.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: vi.fn()
}));

describe('ShadowDomWrapper', () => {
	it('renders children inside shadow DOM when dark mode is disabled', () => {
		(useUserSettings as Mock).mockReturnValue({
			prefs: { carbonioPrefDarkMode: 'disabled' }
		});

		const children = <div data-testid="child">Hello, Shadow DOM!</div>;
		render(<ShadowDomWrapper>{children}</ShadowDomWrapper>);

		const shadowDomWrapper = screen.getByTestId('shadow-dom-wrapper');
		const { shadowRoot } = shadowDomWrapper;
		// eslint-disable-next-line testing-library/no-node-access
		const child = shadowRoot?.querySelector('[data-testid="child"]');

		expect(child).toBeInTheDocument();
		expect(child).toHaveTextContent('Hello, Shadow DOM!');
	});

	it('enables darkreader when dark mode is enabled', async () => {
		(enableDarkReader as Mock).mockClear();
		(useUserSettings as Mock).mockReturnValue({
			prefs: { carbonioPrefDarkMode: 'enabled' }
		});

		const children = <div data-testid="child">Hello, Shadow DOM!</div>;
		setupTest(<ShadowDomWrapper>{children}</ShadowDomWrapper>);

		await waitFor(() => {
			expect(enableDarkReader).toHaveBeenCalledTimes(1);
		});
	});

	it('renders children inside shadow DOM when dark mode is enabled', () => {
		(useUserSettings as Mock).mockReturnValue({
			prefs: { carbonioPrefDarkMode: 'enabled' }
		});

		const children = <div data-testid="child">Hello, Shadow DOM!</div>;
		render(<ShadowDomWrapper>{children}</ShadowDomWrapper>);

		const shadowDomWrapper = screen.getByTestId('shadow-dom-wrapper');
		const { shadowRoot } = shadowDomWrapper;
		// eslint-disable-next-line testing-library/no-node-access
		const child = shadowRoot?.querySelector('[data-testid="child"]');

		expect(child).toBeInTheDocument();
		expect(child).toHaveTextContent('Hello, Shadow DOM!');
	});
});
