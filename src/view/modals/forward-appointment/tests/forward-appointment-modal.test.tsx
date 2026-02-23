/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen } from '@testing-library/react';
import { noop } from 'lodash';

import { UserEvent, setupTest } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { generateSoapErrorResponseBody } from 'test/generators/utils';
import { EventType } from 'types/event';
import { ForwardAppointmentRequest } from 'types/soap/soap-actions';
import { ForwardAppointmentModal } from 'view/modals/forward-appointment/forward-appointment-modal';

async function inputAttendee(user: UserEvent, input: HTMLElement, attendee: string): Promise<void> {
	await act(async () => {
		await user.click(input);
		await user.type(input, attendee);
		await user.tab();
	});
}

describe('ForwardAppointmentModal', () => {
	const event = {
		resource: {
			id: '123'
		}
	} as EventType;

	it('it correctly renders the component', async () => {
		setupTest(<ForwardAppointmentModal event={event} onClose={noop} />);
		expect(await screen.findByText('modal.forwardAppointment.title')).toBeInTheDocument();
		expect(screen.getByText('modal.forwardAppointment.content')).toBeInTheDocument();
		expect(screen.getByText('modal.forwardAppointment.placeholder')).toBeInTheDocument();
		expect(screen.getByText('modal.buttonLabel.forward')).toBeInTheDocument();
		const confirmButton = screen.getByRole('button', {
			name: 'modal.buttonLabel.forward'
		});
		expect(confirmButton).toBeDisabled();
	});

	it('calls onClose when the close icon is clicked', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<ForwardAppointmentModal event={event} onClose={onClose} />);
		const closeIcon = await screen.findByTestId('icon: CloseOutline');
		await user.click(closeIcon);
		expect(onClose).toHaveBeenCalled();
	});

	it('should enable confirm button only if attendees input not empty', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(<ForwardAppointmentModal event={event} onClose={onClose} />);
		const input = await screen.findByTestId('forward-appointment-input');
		await inputAttendee(user, input, faker.internet.email());

		const confirmButton = screen.getByRole('button', {
			name: 'modal.buttonLabel.forward'
		});
		expect(confirmButton).toBeEnabled();
	});

	describe('when user clicks confirm', () => {
		it('forwardAppointmentRequest is called with the correct parameters', async () => {
			const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');
			const { user } = setupTest(<ForwardAppointmentModal event={event} onClose={noop} />);

			const input = await screen.findByTestId('forward-appointment-input');
			const attendee = faker.internet.email();
			await inputAttendee(user, input, attendee);

			const confirmButton = screen.getByRole('button', {
				name: 'modal.buttonLabel.forward'
			});
			await user.click(confirmButton);

			const request = await interceptor;

			expect(request.id).toBe('123');
			expect(request.m.e).toEqual([{ a: attendee, t: 't' }]);
		});

		it('closes the modal', async () => {
			const mockOnClose = vi.fn();
			const interceptor = createSoapAPIInterceptor<ForwardAppointmentRequest>('ForwardAppointment');
			const { user } = setupTest(<ForwardAppointmentModal event={event} onClose={mockOnClose} />);

			const input = await screen.findByTestId('forward-appointment-input');
			await inputAttendee(user, input, faker.internet.email());

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
			const { user } = setupTest(<ForwardAppointmentModal event={event} onClose={noop} />);
			const input = await screen.findByTestId('forward-appointment-input');
			await inputAttendee(user, input, faker.internet.email());

			const confirmButton = screen.getByRole('button', {
				name: 'modal.buttonLabel.forward'
			});
			await user.click(confirmButton);
			await interceptor;
			const errorSnackbar = await screen.findByText('label.error_try_again');
			expect(errorSnackbar).toBeVisible();
		});
	});
});
