/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';

import { CreateGroupAccordionItem } from './create-group-accordion-item';
import { setupTest, screen } from '../../../__test__/test-setup';
import { MODAL_ANIMATION_DURATION } from '../../../constants/test-utils';

describe('CreateGroupAccordionItem', () => {
	it('should render a button with a specific label', () => {
		setupTest(<CreateGroupAccordionItem />);

		expect(screen.getByRole('button', { name: /create New group/i })).toBeVisible();
	});

	it('should call the GetShareInfo API on button click', async () => {
		const { user } = setupTest(<CreateGroupAccordionItem />);
		await user.click(screen.getByRole('button', { name: /create new group/i }));
		act(() => {
			vi.advanceTimersByTime(MODAL_ANIMATION_DURATION);
		});

		expect(screen.getByText(/create new calendar group/i)).toBeVisible();
	});
});
