/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen } from '@testing-library/react';
import { noop } from 'lodash';

import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateSoapErrorResponseBody } from '../../../test/generators/utils';
import { ForwardAppointmentRequest } from '../../../types/soap/soap-actions';
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

	describe('when user clicks confirm', () => {
		it('forwardAppointmentRequest is called with the correct parameters', async () => {
			const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');
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
			await act(async () => {
				await user.click(confirmButton);
			});

			const request = await interceptor;

			expect(request.id).toBe('123');
			expect(request.m.e).toEqual([{ a: attendee, t: 't' }]);
		});

		it('closes the modal', async () => {
			const mockOnClose = jest.fn();
			const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');
			const { user } = setupTest(<ForwardAppointmentModal eventId="123" onClose={mockOnClose} />);

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
			await act(async () => {
				await user.click(confirmButton);
			});
			await interceptor;
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should show an error snackbar when call fails with Fault', async () => {
			const interceptor = createSoapAPIInterceptor(
				'ForwardAppointment',
				generateSoapErrorResponseBody()
			);
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
			await act(async () => {
				await user.click(confirmButton);
			});
			await interceptor;
			const errorSnackbar = await screen.findByText('label.error_try_again');
			expect(errorSnackbar).toBeVisible();
		});
	});
});
