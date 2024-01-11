/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, waitFor, within } from '@testing-library/react';
import { map } from 'lodash';
import { rest } from 'msw';

import { EditorEquipments } from './editor-equipments';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import { useAppStatusStore } from '../../../store/zustand/store';
import { getCustomResources } from '../../../test/mocks/network/msw/handle-autocomplete-gal-request';

const setupEmptyAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ equipment: [] }));
};

describe('Editor equipment', () => {
	test('The component is visible on screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });

		setupEmptyAppStatusStore();
		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });
		await waitFor(() => {
			user.click(screen.getByText('Equipment'));
		});
		expect(screen.getByText('Equipment')).toBeInTheDocument();
	});

	test('On type options are visible on screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Equipment'
			};
		});
		const handler = getCustomResources(items);
		getSetupServer().use(
			rest.post('/service/soap/AutoCompleteGalRequest', async (req, res, ctx) =>
				res(ctx.json(handler))
			)
		);
		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });

		await act(async () => {
			await user.type(screen.getByText('Equipment'), 'resource');
		});

		act(() => {
			jest.runOnlyPendingTimers();
		});

		const dropdown = await screen.findByTestId('dropdown-popper-list');
		expect(within(dropdown).getByText(items[0].label)).toBeVisible();
		expect(within(dropdown).getByText(items[1].label)).toBeVisible();
		expect(within(dropdown).getByText(items[2].label)).toBeVisible();
	});

	test.todo('Clicking on the option will update the editor');

	test.todo('Pressing enter will update the editor');
});
