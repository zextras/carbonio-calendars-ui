/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { SetNewAppointmentTimeModal } from './set-new-appointment-time-modal';
import { setupTest } from '@test-setup';

describe('SetNewAppointmentTimeModal', () => {
	const toggleModal = vi.fn();
	const setNewTime = vi.fn();

	it('renders the modal header with the correct title', () => {
		setupTest(<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />);
		expect(screen.getByText(/reschedule appointment/i)).toBeVisible();
	});

	it('renders the modal message', () => {
		setupTest(<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />);
		expect(
			screen.getByText(/are you sure you want to reschedule the missed appointment\?/i)
		).toBeVisible();
	});

	it('renders the modal footer with OK and Go back buttons', () => {
		setupTest(<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />);
		const okButton = screen.getByRole('button', { name: /ok/i });
		expect(okButton).toBeVisible();
		const goBackButton = screen.getByRole('button', { name: /go back/i });
		expect(goBackButton).toBeVisible();
	});

	it('calls setNewTime when OK is clicked', async () => {
		const { user } = setupTest(
			<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />
		);
		const okButton = screen.getByRole('button', { name: /ok/i });
		await user.click(okButton);
		expect(setNewTime).toHaveBeenCalled();
	});

	it('calls toggleModal when Go back is clicked', async () => {
		const { user } = setupTest(
			<SetNewAppointmentTimeModal toggleModal={toggleModal} setNewTime={setNewTime} />
		);
		const goBackButton = screen.getByRole('button', { name: /go back/i });
		await user.click(goBackButton);
		expect(toggleModal).toHaveBeenCalled();
	});
});
