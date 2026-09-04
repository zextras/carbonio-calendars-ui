/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { createMountpoint } from './create-mountpoint';
import { reducers } from '../redux';
import { getSetupServer } from '@jest-setup';

type CapturedLink = { name: string };

const captureMountpointLink = (): Promise<CapturedLink> =>
	new Promise((resolve) => {
		getSetupServer().use(
			http.post('/service/soap/BatchRequest', async ({ request }) => {
				const body = (await request.json()) as {
					Body: { BatchRequest: { CreateMountpointRequest: Array<{ link: CapturedLink }> } };
				};
				resolve(body.Body.BatchRequest.CreateMountpointRequest[0].link);
				return HttpResponse.json({ Body: {} });
			})
		);
	});

const dispatchCreateMountpoint = async (link: Record<string, unknown>): Promise<CapturedLink> => {
	const capturedLink = captureMountpointLink();
	const store = configureStore({ reducer: combineReducers(reducers) });
	await store.dispatch(createMountpoint([link]) as never);
	return capturedLink;
};

describe('createMountpoint', () => {
	it('always disambiguates the mountpoint name with "of <owner>"', async () => {
		const link = await dispatchCreateMountpoint({
			name: 'Shared Calendar',
			of: 'of',
			ownerName: 'owner@zextras.com',
			ownerId: 'zid-1',
			folderId: '999'
		});

		expect(link.name).toBe('Shared Calendar of owner@zextras.com');
	});
});
