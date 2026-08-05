/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse } from 'msw';

import mockedData from '../../../test/generators';
import { MailMsg } from '../../../types/integrations';
import { Invite } from '../../../types/store/invite';
import { useFetchInvite } from '../useFetchInvite';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';

vi.mock('react-i18next', async () => ({
	...(await vi.importActual('react-i18next')),
	useTranslation: vi.fn().mockReturnValue({
		t: (_key: string, defaultValue: string) => defaultValue
	})
}));

describe('useFetchInvite', () => {
	const baseMailMsg: MailMsg = {
		invite: {
			apptId: '123',
			comp: [{ apptId: '123' }]
		}
	};

	it('returns error when appointment ID is missing', async () => {
		const mailMsg: MailMsg = { invite: null } as any;

		const { result } = renderHook(() => useFetchInvite(mailMsg));

		expect(result.current.error).toBe('MISSING_APPOINTMENT_ID');
		expect(result.current.loading).toBe(false);
	});

	it('sets generic error when GetAppointment returns Fault', async () => {
		createAPIInterceptor(
			'post',
			'/service/soap/GetAppointmentRequest',
			HttpResponse.json({ Fault: {} })
		);

		const { result } = renderHook(() => useFetchInvite(baseMailMsg));

		await waitFor(() => {
			expect(result.current.error).toBe('Something went wrong, please try again');
			expect(result.current.loading).toBe(false);
		});
	});

	it('fetches invite successfully', async () => {
		const event = mockedData.getEvent({ resource: { isRecurrent: true } });
		const invite: Invite = mockedData.getInvite({ event });

		createSoapAPIInterceptor('GetAppointment', {
			appt: [{ inv: invite }]
		});

		const { result } = renderHook(() => useFetchInvite(baseMailMsg));

		await waitFor(() => {
			expect(result.current.invite).toEqual(invite);
			expect(result.current.error).toBeNull();
			expect(result.current.loading).toBe(false);
		});
	});

	it('handles exception during fetch gracefully', async () => {
		createAPIInterceptor('post', '/service/soap/GetAppointmentRequest', HttpResponse.error());

		const { result } = renderHook(() => useFetchInvite(baseMailMsg));

		await waitFor(() => {
			expect(result.current.error).toBe('Something went wrong, please try again');
			expect(result.current.loading).toBe(false);
		});
	});

	it('includes content when includeContent is true', async () => {
		const event = mockedData.getEvent();
		const invite: Invite = mockedData.getInvite({ event });

		const requestBody = '';
		createSoapAPIInterceptor('GetAppointment', {
			appt: [{ inv: invite }]
		});

		const { result } = renderHook(() => useFetchInvite(baseMailMsg, true));

		await waitFor(() => {
			expect(result.current.invite).toEqual(invite);
			expect(result.current.error).toBeNull();
			expect(result.current.loading).toBe(false);
		});
	});

	describe('when GetAppointment returns one <inv> per occurrence of a recurring series', () => {
		const masterInv = { comp: [{ name: 'master occurrence' }] };
		const exceptionJune17Inv = {
			comp: [{ name: 'june 17 exception', exceptId: [{ d: '20260617T110000', tz: 'Europe/Rome' }] }]
		};
		const exceptionAug4Inv = {
			comp: [{ name: 'aug 4 exception', exceptId: [{ d: '20260804T110000', tz: 'Europe/Rome' }] }]
		};

		it('selects the invite whose exceptId matches the mail message being viewed', async () => {
			const mailMsg: MailMsg = {
				invite: [
					{ comp: [{ apptId: '123', exceptId: [{ d: '20260804T110000', tz: 'Europe/Rome' }] }] }
				]
			} as any;
			createSoapAPIInterceptor('GetAppointment', {
				appt: [{ inv: [masterInv, exceptionJune17Inv, exceptionAug4Inv] }]
			});

			const { result } = renderHook(() => useFetchInvite(mailMsg));

			await waitFor(() => {
				expect(result.current.invite).toEqual([exceptionAug4Inv]);
			});
		});

		it('falls back to the unfiltered list when the mail message has no exceptId', async () => {
			createSoapAPIInterceptor('GetAppointment', {
				appt: [{ inv: [masterInv, exceptionJune17Inv, exceptionAug4Inv] }]
			});

			const { result } = renderHook(() => useFetchInvite(baseMailMsg));

			await waitFor(() => {
				expect(result.current.invite).toEqual([masterInv, exceptionJune17Inv, exceptionAug4Inv]);
			});
		});

		it('falls back to the unfiltered list when no entry matches the exceptId', async () => {
			const mailMsg: MailMsg = {
				invite: [
					{ comp: [{ apptId: '123', exceptId: [{ d: '20261231T110000', tz: 'Europe/Rome' }] }] }
				]
			} as any;
			createSoapAPIInterceptor('GetAppointment', {
				appt: [{ inv: [masterInv, exceptionJune17Inv, exceptionAug4Inv] }]
			});

			const { result } = renderHook(() => useFetchInvite(mailMsg));

			await waitFor(() => {
				expect(result.current.invite).toEqual([masterInv, exceptionJune17Inv, exceptionAug4Inv]);
			});
		});
	});
});
