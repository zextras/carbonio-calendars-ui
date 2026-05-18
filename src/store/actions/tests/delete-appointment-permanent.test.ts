/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ONE_MB, QuotaChangedEvent } from '../../../event-bus/quota-changed';
import mockedData from '../../../test/generators';
import { RootState } from '../../redux';
import { deleteAppointmentPermanent } from '../delete-appointment-permanent';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const INVITE_ID = 'invite-under-test';

const buildState = (attachmentsSize: number): Partial<RootState> => ({
	invites: {
		invites: {
			[INVITE_ID]: {
				...mockedData.getInvite(),
				attachmentFiles: attachmentsSize > 0 ? [{ size: attachmentsSize }] : []
			}
		},
		status: ''
	}
});

const countQuotaEvents = (spy: ReturnType<typeof vi.spyOn>): number =>
	spy.mock.calls.filter(([event]: [Event]) => event instanceof QuotaChangedEvent).length;

describe('deleteAppointmentPermanent quota dispatch', () => {
	it('dispatches when the invite had attachments exceeding 1 MB', async () => {
		createSoapAPIInterceptor('ItemAction', { action: { id: INVITE_ID, op: 'delete' } });
		const spy = vi.spyOn(window, 'dispatchEvent');
		const getState = vi.fn(() => buildState(ONE_MB + 1) as RootState);

		const thunk = deleteAppointmentPermanent({ id: INVITE_ID });
		await thunk(vi.fn(), getState, { rejectWithValue: vi.fn() });

		expect(countQuotaEvents(spy)).toBe(1);
	});

	it('does not dispatch when the invite had no attachments', async () => {
		createSoapAPIInterceptor('ItemAction', { action: { id: INVITE_ID, op: 'delete' } });
		const spy = vi.spyOn(window, 'dispatchEvent');
		const getState = vi.fn(() => buildState(0) as RootState);

		const thunk = deleteAppointmentPermanent({ id: INVITE_ID });
		await thunk(vi.fn(), getState, { rejectWithValue: vi.fn() });

		expect(countQuotaEvents(spy)).toBe(0);
	});

	it('does not dispatch when attachments were below the threshold', async () => {
		createSoapAPIInterceptor('ItemAction', { action: { id: INVITE_ID, op: 'delete' } });
		const spy = vi.spyOn(window, 'dispatchEvent');
		const getState = vi.fn(() => buildState(100 * 1024) as RootState);

		const thunk = deleteAppointmentPermanent({ id: INVITE_ID });
		await thunk(vi.fn(), getState, { rejectWithValue: vi.fn() });

		expect(countQuotaEvents(spy)).toBe(0);
	});
});
