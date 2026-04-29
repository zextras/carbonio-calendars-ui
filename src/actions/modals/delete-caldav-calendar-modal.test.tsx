/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import { setupTest, screen } from '@test-setup';
import { DeleteCaldavCalendarModal } from './delete-caldav-calendar-modal';

const folder = { id: '42', name: 'My CalDAV' };

describe('DeleteCaldavCalendarModal', () => {
	it('renders title and warning text with the folder name', () => {
		setupTest(<DeleteCaldavCalendarModal folder={folder} onClose={vi.fn()} onConfirm={vi.fn()} />);
		expect(screen.getByText("Delete 'My CalDAV' permanently")).toBeVisible();
		expect(
			screen.getByText(
				"Are you sure you want to permanently delete all the external calendars inside 'My CalDAV'? This action is irreversible."
			)
		).toBeVisible();
	});

	it('renders YES, DELETE button enabled by default', () => {
		setupTest(<DeleteCaldavCalendarModal folder={folder} onClose={vi.fn()} onConfirm={vi.fn()} />);
		expect(screen.getByRole('button', { name: 'YES, DELETE' })).toBeEnabled();
	});

	it('calls onConfirm, shows success snackbar and closes on confirm', async () => {
		const onClose = vi.fn();
		const onConfirm = vi.fn().mockResolvedValue(undefined);
		const { user } = setupTest(
			<DeleteCaldavCalendarModal folder={folder} onClose={onClose} onConfirm={onConfirm} />
		);
		await user.click(screen.getByRole('button', { name: 'YES, DELETE' }));
		await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(screen.getByText('Calendars permanently deleted')).toBeVisible());
		await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
	});

	it('shows error snackbar and re-enables button when onConfirm rejects', async () => {
		const onConfirm = vi.fn().mockRejectedValue(new Error('delete failed'));
		const { user } = setupTest(
			<DeleteCaldavCalendarModal folder={folder} onClose={vi.fn()} onConfirm={onConfirm} />
		);
		await user.click(screen.getByRole('button', { name: 'YES, DELETE' }));
		await waitFor(() =>
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible()
		);
		expect(screen.getByRole('button', { name: 'YES, DELETE' })).toBeEnabled();
	});

	it('disables confirm button while submission is in progress', async () => {
		let resolve: (() => void) | undefined;
		const pendingConfirm = new Promise<void>((res) => {
			resolve = res;
		});
		const onConfirm = vi.fn().mockReturnValue(pendingConfirm);
		const { user } = setupTest(
			<DeleteCaldavCalendarModal folder={folder} onClose={vi.fn()} onConfirm={onConfirm} />
		);
		const button = screen.getByRole('button', { name: 'YES, DELETE' });
		await user.click(button);
		expect(button).toBeDisabled();
		resolve?.();
	});

	it('calls onClose when close icon is clicked', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(
			<DeleteCaldavCalendarModal folder={folder} onClose={onClose} onConfirm={vi.fn()} />
		);
		await user.click(screen.getByTestId('icon: CloseOutline'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
