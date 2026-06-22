/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	sendInviteResponseFulfilled,
	sendInviteResponsePending,
	sendInviteResponseRejected
} from '../send-invite-response';
import { InvitesSlice } from '../../../types/store/store';
import mockedData from '../../../test/generators';

const makeState = (overrides?: Partial<InvitesSlice>): InvitesSlice => ({
	status: 'idle',
	invites: {},
	...overrides
});

describe('sendInviteResponsePending', () => {
	it('sets status to pending when fromMail is false', () => {
		const state = makeState();
		const action = { meta: { arg: { inviteId: 'inv-1', fromMail: false } } } as any;
		sendInviteResponsePending(state, action);
		expect(state.status).toBe('pending');
	});

	it('does not change status when fromMail is true', () => {
		const state = makeState({ status: 'idle' });
		const action = { meta: { arg: { inviteId: 'inv-1', fromMail: true } } } as any;
		sendInviteResponsePending(state, action);
		expect(state.status).toBe('idle');
	});
});

describe('sendInviteResponseFulfilled', () => {
	it('sets status to fulfilled when fromMail is false', () => {
		const state = makeState();
		const action = {
			payload: { apptId: '1', calItemId: '2', invId: '3' },
			meta: { arg: { inviteId: 'inv-1', fromMail: false } }
		} as any;
		sendInviteResponseFulfilled(state, action);
		expect(state.status).toBe('fulfilled');
	});

	it('does not change status when fromMail is true', () => {
		const state = makeState({ status: 'pending' });
		const action = {
			payload: { apptId: '1', calItemId: '2', invId: '3' },
			meta: { arg: { inviteId: 'inv-1', fromMail: true } }
		} as any;
		sendInviteResponseFulfilled(state, action);
		expect(state.status).toBe('pending');
	});

	it('removes the invite from state when payload is truthy', () => {
		const invite = mockedData.getInvite();
		const state = makeState({ invites: { 'inv-1': invite } });
		const action = {
			payload: { apptId: '1', calItemId: '2', invId: '3' },
			meta: { arg: { inviteId: 'inv-1', fromMail: false } }
		} as any;
		sendInviteResponseFulfilled(state, action);
		expect(state.invites['inv-1']).toBeUndefined();
	});

	it('keeps the invite in state when payload is null', () => {
		const invite = mockedData.getInvite();
		const state = makeState({ invites: { 'inv-1': invite } });
		const action = {
			payload: null,
			meta: { arg: { inviteId: 'inv-1', fromMail: false } }
		} as any;
		sendInviteResponseFulfilled(state, action);
		expect(state.invites['inv-1']).toBeDefined();
	});
});

describe('sendInviteResponseRejected', () => {
	it('sets status to error', () => {
		const state = makeState({ status: 'pending' });
		sendInviteResponseRejected(state);
		expect(state.status).toBe('error');
	});
});
