/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import {
	InviteReplyVerb,
	SendInviteReplyFulfilledType,
	SendInviteReplyRequest
} from '../../../soap/send-invite-reply-request';
import { reducers } from '../../redux';
import { sendInviteResponse } from '../send-invite-response';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('sendInviteResponse', () => {
	it('rejects when the SOAP response contains a Fault', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		createSoapAPIInterceptor('SendInviteReply', {
			Fault: {
				Code: { Value: 'SOAP-ENV:Receiver' },
				Reason: { Text: 'Service failure' },
				Detail: { Error: { Code: 'SERVICE.FAILURE', Trace: '', _jsns: 'urn:zimbra' } }
			}
		});

		const result = await store.dispatch(
			sendInviteResponse({
				inviteId: 'invite-123',
				action: InviteReplyVerb.ACCEPT,
				updateOrganizer: true
			})
		);

		expect(result.type).toBe('invites/sendInviteResponse/rejected');
	});

	it('fulfills when the SOAP response is successful', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		createSoapAPIInterceptor('SendInviteReply', {
			apptId: 'appt-123',
			calItemId: 'cal-123',
			invId: 'inv-123'
		});

		const result = await store.dispatch(
			sendInviteResponse({
				inviteId: 'invite-123',
				action: InviteReplyVerb.ACCEPT,
				updateOrganizer: true
			})
		);

		expect(result.type).toBe('invites/sendInviteResponse/fulfilled');
	});

	it('sends the default identity id as idnt so the reply is not sent from a random identity', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const apiInterceptor = createSoapAPIInterceptor<
			SendInviteReplyRequest,
			SendInviteReplyFulfilledType
		>('SendInviteReply', {
			apptId: 'appt-123',
			calItemId: 'cal-123',
			invId: 'inv-123'
		});

		store.dispatch(
			sendInviteResponse({
				inviteId: 'invite-123',
				action: InviteReplyVerb.ACCEPT,
				updateOrganizer: true
			})
		);

		const request = await apiInterceptor;
		expect(request.idnt).toBe('1');
	});
});
