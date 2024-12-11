/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, within } from '@testing-library/react';
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { http, HttpResponse } from 'msw';

import { getSetupServer } from '../../../../carbonio-ui-commons/test/jest-setup';
import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';
import { buildSoapErrorResponseBody } from '../../../../carbonio-ui-commons/test/mocks/utils/soap';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { TEST_SELECTORS } from '../../../../constants/test-utils';
import { mockFreeBusyResponse } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { useAppStatusStore } from '../../../../store/zustand/store';
import { getCustomResources } from '../../../../test/mocks/network/msw/handle-autocomplete-gal-request';
import { EditorEquipments } from '../editor-equipments';

const setupEmptyAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ equipment: [] }));
};

describe('Editor equipment', () => {
	it('should display the Equipment input on the screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		setupEmptyAppStatusStore();
		setupTest(<EditorEquipments editorId={editor.id} />, { store });

		expect(screen.getByText('Equipment')).toBeInTheDocument();
	});
	it('should render the chip when present in the store', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const equipment1 = {
			label: 'automobile 1',
			email: 'auto1@equipment.test'
		};

		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, equipment: [equipment1] }
		});

		setupTest(<EditorEquipments editorId={editor.id} />, { store });

		expect(screen.getByText(/automobile 1/i)).toBeVisible();
	});
	it('should display equipment busy when is already booked', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const equipment1 = {
			label: 'equipment 1',
			email: 'equipment1@test.com'
		};
		const start = new Date(2024, 1, 10, 11, 0).getTime();
		const end = new Date(2024, 1, 10, 12, 0).getTime();
		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				start,
				end,
				equipment: [equipment1]
			}
		});
		const freeBusyInterceptor = mockFreeBusyResponse([
			{
				id: equipment1.email,
				b: [{ s: start, e: end }]
			}
		]);

		setupTest(<EditorEquipments editorId={editor.id} />, { store });
		await freeBusyInterceptor;

		expect(screen.getByText(equipment1.label)).toBeVisible();
		expect(await screen.findByTestId('icon: AlertTriangle')).toBeVisible();
	});
	it('should display options on screen when typing', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Equipment'
			};
		});
		const handler = getCustomResources(items);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(handler))
		);
		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });

		await user.type(screen.getByText('Equipment'), 'resource');

		await act(async () => {
			await jest.advanceTimersToNextTimerAsync();
		});

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		expect(within(dropdown).getByText(items[0].label)).toBeVisible();
		expect(within(dropdown).getByText(items[1].label)).toBeVisible();
		expect(within(dropdown).getByText(items[2].label)).toBeVisible();
	});
	it('should add a chip when selecting an option', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Equipment'
			};
		});
		const handler = getCustomResources(items);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(handler))
		);
		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });
		await user.type(screen.getByText('Equipment'), 'resource');
		await act(async () => {
			await jest.advanceTimersToNextTimerAsync();
		});
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		await user.click(within(dropdown).getByText(items[0].label));
		expect(dropdown).not.toBeInTheDocument();
		await act(async () => {
			await jest.advanceTimersToNextTimerAsync();
		});
		expect(screen.getByText(/resource 0/i)).toBeVisible();
	});
	it('should select the first option when pressing enter', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Equipment'
			};
		});
		const handler = getCustomResources(items);
		mockFreeBusyResponse([]);

		getSetupServer().use(
			http.post<never, CarbonioMailboxRestHandlerRequest<any>, SuccessSoapResponse<any>>(
				'/service/soap/AutoCompleteGalRequest',
				async () => HttpResponse.json(handler)
			)
		);
		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });

		await user.type(screen.getByText('Equipment'), 'resource');

		await act(async () => {
			await jest.advanceTimersToNextTimerAsync();
		});

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		await user.keyboard('[Enter]');
		expect(dropdown).not.toBeInTheDocument();
		expect(screen.getByText(/resource 0/i)).toBeVisible();
	});
	it('should not remove the already existing chips when adding a new one', async () => {
		const equipment1 = {
			label: 'automobile 1',
			email: 'auto1@equipment.test'
		};
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, equipment: [equipment1] }
		});
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Equipment'
			};
		});
		const handler = getCustomResources(items);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(handler))
		);

		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });

		await user.type(screen.getByText('Equipment'), 'resource');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		const selectedEquipmentLabel = items[0].label;
		await user.click(within(dropdown).getByText(selectedEquipmentLabel));

		expect(screen.getByText(equipment1.label)).toBeVisible();
		expect(screen.getByText(selectedEquipmentLabel)).toBeVisible();
	});
	it('should not add a new chip that already exists', async () => {
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Equipment'
			};
		});
		const selectedEquipment = items[0];
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, equipment: [selectedEquipment] }
		});
		const handler = getCustomResources(items);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(handler))
		);

		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });

		await user.type(screen.getByText('Equipment'), 'resource');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await user.click(within(dropdown).getByText(selectedEquipment.label));

		expect((await screen.findAllByText(selectedEquipment.label)).length).toBe(1);
	});
	it('should leave options dropdown open with loader when call to AutoCompleteGal api fails with generic 500', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [] }
		});
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.error())
		);

		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });
		await user.type(screen.getByText('Equipment'), 'resource');

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		expect(within(dropdown).getByTestId('dropdown-options-loader')).toBeVisible();
	});
	it('should leave options dropdown open with loader when call to AutoCompleteGal api fails with Soap Fault', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [] }
		});

		const interceptor = createSoapAPIInterceptor('AutoCompleteGal', buildSoapErrorResponseBody());

		const { user } = setupTest(<EditorEquipments editorId={editor.id} />, { store });
		await user.type(screen.getByText('Equipment'), 'resource');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await interceptor;

		expect(within(dropdown).getByTestId('dropdown-options-loader')).toBeVisible();
	});
});
