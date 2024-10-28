/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { useNotify } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../carbonio-ui-commons/test/test-setup';
import { folderWorker } from '../../../carbonio-ui-commons/worker';
import { reducers } from '../../../store/redux';
import { useSyncDataHandler } from '../use-sync-data-handler';

jest.mock('../../../carbonio-ui-commons/worker');

describe('sync data handler', () => {
	describe('folders', () => {
		test('it will invoke the folders worker when a folders related notify is received', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			populateFoldersStore();
			const notify = { deleted: ['15'], seq: 0 };
			const workerSpy = jest.spyOn(folderWorker, 'postMessage');

			useNotify.mockReturnValueOnce([notify]);

			setupHook(useSyncDataHandler, { store });

			expect(workerSpy).toHaveBeenCalledTimes(1);
			expect(workerSpy).toHaveBeenCalledWith(
				expect.objectContaining({ op: 'notify', notify, state: expect.any(Object) })
			);
		});
	});
});
