/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useUserSettings } from '@zextras/carbonio-shell-ui';

import { ShadowDomWrapper } from '../shadow-dom-wrapper';

jest.mock('darkreader', () => ({
	...jest.requireActual('darkreader'),
	enable: jest.fn(),
	exportGeneratedCSS: jest.fn().mockResolvedValue('anyvalue')
}));

jest.mock('@zextras/carbonio-shell-ui', () => ({
	useUserSettings: jest.fn()
}));

describe('ShadowDomWrapper', () => {
	it('renders children inside shadow DOM when dark mode is disabled', () => {
		const children = <div data-testid="child">Hello, Shadow DOM!</div>;
		(useUserSettings as jest.Mock).mockReturnValue({ props: [] });
		render(<ShadowDomWrapper>{children}</ShadowDomWrapper>);

		const shadowDomWrapper = screen.getByTestId('shadow-dom-wrapper');
		const { shadowRoot } = shadowDomWrapper;
		// eslint-disable-next-line testing-library/no-node-access
		const child = shadowRoot?.querySelector('[data-testid="child"]');

		expect(child).toBeInTheDocument();
		expect(child).toHaveTextContent('Hello, Shadow DOM!');
	});

	it('renders children inside shadow DOM when dark mode is enabled', () => {
		(useUserSettings as jest.Mock).mockReturnValue({
			props: [{ name: 'zappDarkreaderMode', _content: 'enabled', zimlet: 'carbonio-shell-ui' }]
		});

		const children = <div data-testid="child">Hello, Shadow DOM!</div>;
		(useUserSettings as jest.Mock).mockReturnValue({ props: [] });
		render(<ShadowDomWrapper>{children}</ShadowDomWrapper>);

		const shadowDomWrapper = screen.getByTestId('shadow-dom-wrapper');
		const { shadowRoot } = shadowDomWrapper;
		// eslint-disable-next-line testing-library/no-node-access
		const child = shadowRoot?.querySelector('[data-testid="child"]');

		expect(child).toBeInTheDocument();
		expect(child).toHaveTextContent('Hello, Shadow DOM!');
	});
});
