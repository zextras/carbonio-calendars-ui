/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { AddIcsFromUrlModal } from './add-ics-from-url-modal';
import { setupTest, screen } from '@test-setup';

describe('AddIcsFromUrlModal', () => {
	test('renders modal content', () => {
		setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		expect(screen.getByText('Add ICS from URL')).toBeVisible();
		expect(screen.getByRole('textbox', { name: 'Calendar ICS URL*' })).toBeVisible();
		expect(screen.getByRole('textbox', { name: 'Calendar name*' })).toBeVisible();
		expect(screen.getByText('Select color')).toBeVisible();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
		expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	test('enables add button after required fields are filled', async () => {
		const { user } = setupTest(<AddIcsFromUrlModal onClose={vi.fn()} />);

		await user.type(screen.getByRole('textbox', { name: 'Calendar ICS URL*' }), 'a');
		await user.type(screen.getByRole('textbox', { name: 'Calendar name*' }), 'b');

		expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
	});

	test('calls onClose on cancel click', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<AddIcsFromUrlModal onClose={onClose} />);
		await user.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
