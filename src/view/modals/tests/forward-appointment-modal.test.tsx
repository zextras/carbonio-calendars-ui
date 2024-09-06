/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen } from '@testing-library/react';
import { noop } from 'lodash';

import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import * as forwardAppointmentRequest from '../../../soap/forward-appointment-request';
import { ForwardAppointmentModal } from '../forward-appointment-modal';

describe('ForwardAppointmentModal', () => {
	it('it correctly renders the component', async () => {
		setupTest(<ForwardAppointmentModal eventId="" onClose={noop} />);
		expect(await screen.findByText('modal.forwardAppointment.title')).toBeInTheDocument();
		expect(screen.getByText('modal.forwardAppointment.content')).toBeInTheDocument();
		expect(screen.getByText('modal.forwardAppointment.placeholder')).toBeInTheDocument();
		expect(screen.getByText('modal.buttonLabel.forward')).toBeInTheDocument();
	});

	it('calls onClose when the close button is clicked', async () => {
		const onClose = jest.fn();
		const { user } = setupTest(<ForwardAppointmentModal eventId="" onClose={onClose} />);
		const closeButton = await screen.findByTestId('icon: CloseOutline');
		await act(async () => {
			await user.click(closeButton);
		});
		expect(onClose).toHaveBeenCalled();
	});

	it('calls forwardAppointmentRequest with the correct parameters when the confirm button is clicked', async () => {
		const { user } = setupTest(<ForwardAppointmentModal eventId="123" onClose={noop} />);
		const input = await screen.findByTestId('forward-appointment-input');
		const attendee = faker.internet.email();
		await act(async () => {
			await user.click(input);
			await user.type(input, attendee);
			await user.tab();
		});

		const confirmButton = screen.getByRole('button', {
			name: 'modal.buttonLabel.forward'
		});
		const forwardAppointmnetSpy = jest.spyOn(
			forwardAppointmentRequest,
			'forwardAppointmentRequest'
		);
		await act(async () => {
			await user.click(confirmButton);
		});
		expect(forwardAppointmnetSpy).toHaveBeenCalledTimes(1);
		expect(forwardAppointmnetSpy).toHaveBeenCalledWith({ id: '123', attendees: [attendee] });
	});
});
