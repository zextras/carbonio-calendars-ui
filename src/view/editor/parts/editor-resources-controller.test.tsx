/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { EditorResourcesController } from './editor-resources-controller';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { useAppStatusStore } from '../../../store/zustand/store';
import { getLessThan100Resources } from '../../../test/mocks/network/msw/handle-autocomplete-gal-request';

const setupAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ resources: undefined }));
};

describe('editor resources controller', () => {
	test('If there are no resources the store is empty', async () => {
		setupAppStatusStore();
		await waitFor(() => {
			setupTest(<EditorResourcesController />);
		});
		expect(useAppStatusStore.getState().resources).toStrictEqual([]);
	});
	test('If there are resources they are saved inside the store', async () => {
		setupAppStatusStore();
		const response = getLessThan100Resources();

		getSetupServer().use(
			rest.post('/service/soap/AutoCompleteGalRequest', (req, res, ctx) => res(ctx.json(response)))
		);
		await waitFor(() => {
			setupTest(<EditorResourcesController />);
		});
		expect(useAppStatusStore.getState().resources).toHaveLength(
			response.Body.AutoCompleteGalResponse.cn.length
		);
	});
});
