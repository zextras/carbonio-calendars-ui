/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { SEND_UPDATE_OPTIONS, SendUpdateModal } from '../send-update-modal';
import { setupTest } from '@test-setup';

describe('SendUpdateModal', () => {
	it('renders the description and the hint line', () => {
		setupTest(<SendUpdateModal onClose={vi.fn()} onConfirm={vi.fn()} />);
		expect(
			screen.getByText("You've changed the attendee list. Who should get the update?")
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"If you're unsure everyone has received the invitation, choose All attendees."
			)
		).toBeInTheDocument();
	});

	it('renders only the two default options when showSaveWithoutSendingOption is not set', () => {
		setupTest(<SendUpdateModal onClose={vi.fn()} onConfirm={vi.fn()} />);
		expect(screen.getByText('Only added attendees')).toBeInTheDocument();
		expect(screen.getByText('All attendees')).toBeInTheDocument();
		expect(screen.queryByText('Save without sending')).not.toBeInTheDocument();
	});

	it('renders the "Save without sending" option when showSaveWithoutSendingOption is true', () => {
		setupTest(
			<SendUpdateModal onClose={vi.fn()} onConfirm={vi.fn()} showSaveWithoutSendingOption />
		);
		expect(screen.getByText('Save without sending')).toBeInTheDocument();
	});

	it('defaults to "only added attendees" when confirmed without interaction', async () => {
		const onConfirm = vi.fn();
		const { user } = setupTest(<SendUpdateModal onClose={vi.fn()} onConfirm={onConfirm} />);
		await user.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onConfirm).toHaveBeenCalledWith(SEND_UPDATE_OPTIONS.ADDED_OR_REMOVED);
	});

	it('confirms with "all attendees" after selecting that option', async () => {
		const onConfirm = vi.fn();
		const { user } = setupTest(<SendUpdateModal onClose={vi.fn()} onConfirm={onConfirm} />);
		await user.click(screen.getByText('All attendees'));
		await user.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onConfirm).toHaveBeenCalledWith(SEND_UPDATE_OPTIONS.ALL);
	});

	it('confirms with "save without sending" after selecting that option', async () => {
		const onConfirm = vi.fn();
		const { user } = setupTest(
			<SendUpdateModal onClose={vi.fn()} onConfirm={onConfirm} showSaveWithoutSendingOption />
		);
		await user.click(screen.getByText('Save without sending'));
		await user.click(screen.getByRole('button', { name: 'Confirm' }));
		expect(onConfirm).toHaveBeenCalledWith(SEND_UPDATE_OPTIONS.SAVE_WITHOUT_SENDING);
	});

	it('calls onClose when clicking cancel', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<SendUpdateModal onClose={onClose} onConfirm={vi.fn()} />);
		await user.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onClose).toHaveBeenCalled();
	});
});
