/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { reducers } from '../../store/redux';
import { Editor } from '../../types/editor';
import { onSend } from '../editor-save-send-fns';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { generateSendToDistributionListDeniedResponseBody } from 'test/generators/utils';

vi.mock('../../normalizations/normalize-soap-message-from-editor', () => ({
	normalizeSoapMessageFromEditor: vi.fn(() => ({}))
}));

const editor = { id: 'editor-id', attachmentFiles: [] } as unknown as Editor;

describe('onSend for a new appointment', () => {
	it('resolves with the response and the updated editor when the appointment is created', async () => {
		createSoapAPIInterceptor('CreateAppointment', { calItemId: '1', invId: '1-inv' });
		const store = configureStore({ reducer: combineReducers(reducers) });

		const result = await onSend({ isNew: true, editor, dispatch: store.dispatch });

		expect(result.response).toEqual(expect.objectContaining({ invId: '1-inv' }));
		expect(result.editor).toEqual(expect.objectContaining({ isNew: false, inviteId: '1-inv' }));
	});

	it('resolves with the fault when the appointment cannot be created', async () => {
		const { Fault } = generateSendToDistributionListDeniedResponseBody({
			invalid: ['devs@test.com']
		});
		createSoapAPIInterceptor('CreateAppointment', { Fault });
		const store = configureStore({ reducer: combineReducers(reducers) });

		const result = await onSend({ isNew: true, editor, dispatch: store.dispatch });

		expect(result.response).toBeUndefined();
		expect(result.Detail).toEqual(Fault.Detail);
	});
});
