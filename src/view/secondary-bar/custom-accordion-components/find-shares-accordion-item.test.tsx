/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { FindSharesAccordionItem } from './find-shares-accordion-item';
import { createSoapAPIInterceptor } from '../../../__test__/mocks/network/msw/create-api-interceptor';
import { setupTest, screen } from '../../../__test__/test-setup';

describe('FindSharesAccordionItem', () => {
	it('should render a button with a specific label', () => {
		setupTest(<FindSharesAccordionItem />);

		expect(screen.getByRole('button', { name: 'Find shares' })).toBeVisible();
	});

	it('should call the GetShareInfo API on button click', async () => {
		const apiInterceptor = createSoapAPIInterceptor('GetShareInfo', {});

		setupTest(<FindSharesAccordionItem />);

		const button = screen.getByRole('button', { name: 'Find shares' });
		await button.click();

		expect(apiInterceptor).resolves.toBeDefined();
	});
});
