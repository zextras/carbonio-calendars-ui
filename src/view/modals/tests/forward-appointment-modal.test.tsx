/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, screen } from '@testing-library/react';
import { noop } from 'lodash';

import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { ForwardAppointmentModal } from '../forward-appointment-modal';

describe('ForwardAppointmentModal', () => {
	it('it correctly renders the component', async () => {
		setupTest(<ForwardAppointmentModal onClose={noop} />);
		expect(await screen.findByText('modal.forwardAppointment.title')).toBeInTheDocument();
		expect(screen.getByText('modal.forwardAppointment.content')).toBeInTheDocument();
		expect(screen.getByText('modal.buttonLabel.forward')).toBeInTheDocument();
		expect(screen.getByText('modal.forwardAppointment.placeholder')).toBeInTheDocument();
	});

	it('calls onClose when the close button is clicked', async () => {
		const onClose = jest.fn();
		const { user } = setupTest(<ForwardAppointmentModal onClose={onClose} />);
		const closeButton = await screen.findByTestId('icon: CloseOutline');
		await act(async () => {
			await user.click(closeButton);
		});
		expect(onClose).toHaveBeenCalled();
	});

	// it('refreshes the page when the confirm button is clicked', async () => {
	// 	const { user } = setupTest(<ForwardAppointmentModal onClose={noop} />);
	// 	const refreshButton = screen.getByRole('button', {
	// 		name: 'modal.initializeError.buttonConfirm'
	// 	});
	// 	await act(async () => {
	// 		await user.click(refreshButton);
	// 	});
	// 	expect(window.location.reload).toHaveBeenCalled();
	// });
});
