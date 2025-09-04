/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useTagStore } from '@zextras/carbonio-ui-commons';

import { TagsAccordion } from './tags-accordion';
import { setupTest, screen } from '../../__test__/test-setup';

describe('TagsAccordion', () => {
	it('should render the tags accordion with the correct items', async () => {
		const tags = {
			'1': {
				id: '1',
				name: 'ZZZZ AAAA',
				color: 4,
				n: 46
			},
			'9999': {
				id: '9999',
				name: 'AAAA BBBB',
				color: 5,
				n: 23
			}
		};
		useTagStore.setState({ tags });

		const { user } = setupTest(<TagsAccordion />);

		expect(screen.getByText('Tags')).toBeVisible();

		await user.click(screen.getByText('Tags'));

		expect(screen.getByText('AAAA BBBB')).toBeVisible();
		expect(screen.getByText('ZZZZ AAAA')).toBeVisible();
	});
});
