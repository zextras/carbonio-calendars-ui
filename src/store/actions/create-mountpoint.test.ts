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
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

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
	it('uses the plain calendar name when no calendar with that name exists in the main account', async () => {
		populateFoldersStore();

		const link = await dispatchCreateMountpoint({
			name: 'Shared Calendar',
			of: 'of',
			ownerName: 'owner@zextras.com',
			ownerId: 'zid-1',
			folderId: '999'
		});

		expect(link.name).toBe('Shared Calendar');
	});

	it('appends "of <owner>" when a calendar with that name already exists in the main account', async () => {
		const existingFolder = generateFolder({
			view: 'appointment',
			id: '2345',
			name: 'Shared Calendar'
		});
		populateFoldersStore({ customFolders: [existingFolder] });

		const link = await dispatchCreateMountpoint({
			name: 'Shared Calendar',
			of: 'of',
			ownerName: 'owner@zextras.com',
			ownerId: 'zid-1',
			folderId: '999'
		});

		expect(link.name).toBe('Shared Calendar of owner@zextras.com');
	});

	it('does not append "of <owner>" for a name collision with a calendar belonging to a different (delegated) account', async () => {
		const delegatedFolder = generateFolder({
			view: 'appointment',
			id: 'delegated-account-id:2345',
			l: 'delegated-account-id:1',
			name: 'Shared Calendar'
		});
		populateFoldersStore({ customFolders: [delegatedFolder] });

		const link = await dispatchCreateMountpoint({
			name: 'Shared Calendar',
			of: 'of',
			ownerName: 'owner@zextras.com',
			ownerId: 'zid-1',
			folderId: '999'
		});

		expect(link.name).toBe('Shared Calendar');
	});
});
