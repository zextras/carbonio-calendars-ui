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
import moment from 'moment';
import { http, HttpResponse } from 'msw';

import { EditorMeetingRooms } from './editor-meeting-rooms';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import { reducers } from '../../../store/redux';
import { useAppStatusStore } from '../../../store/zustand/store';
import { getCustomResources } from '../../../test/mocks/network/msw/handle-autocomplete-gal-request';
import { handleGetFreeBusyCustomResponse } from '../../../test/mocks/network/msw/handle-get-free-busy';
import { Resource } from '../../../types/editor';

const setupEmptyAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ meetingRoom: [] }));
};

const setupBackendResponse = (items: Resource[]): void => {
	const freeBusyArrayItems = map(items, (item) => ({
		id: item.email,
		f: [
			{
				s: moment().startOf('day').valueOf(),
				e: moment().endOf('day').valueOf()
			}
		]
	}));

	const response = handleGetFreeBusyCustomResponse(freeBusyArrayItems);

	getSetupServer().use(
		http.post('/service/soap/GetFreeBusyRequest', () => HttpResponse.json(response))
	);
};

describe('Editor meeting rooms', () => {
	test('The component is visible on screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		setupEmptyAppStatusStore();
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		await waitFor(() => {
			user.click(screen.getByText('Meeting room'));
		});
		expect(screen.getByText('Meeting room')).toBeInTheDocument();
	});

	test('On type options are visible on screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		const soapResponse = getCustomResources(items);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await act(async () => {
			await user.type(screen.getByText('Meeting room'), 'resource');
		});

		act(() => {
			jest.runOnlyPendingTimers();
		});

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		expect(within(dropdown).getByText(items[0].label)).toBeVisible();
		expect(within(dropdown).getByText(items[1].label)).toBeVisible();
		expect(within(dropdown).getByText(items[2].label)).toBeVisible();
	});

	test('Clicking on the option will update the editor', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		const soapResponse = getCustomResources(items);

		setupBackendResponse([items[0]]);

		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await act(async () => {
			await user.type(screen.getByText('Meeting room'), 'resource');
		});

		act(() => {
			jest.runOnlyPendingTimers();
		});

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		await act(async () => {
			await user.click(within(dropdown).getByText(items[0].label));
		});
		expect(dropdown).not.toBeInTheDocument();
		expect(screen.getByText(/resource 0/i)).toBeVisible();
	});

	test('Pressing enter will update the editor', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });
		const items = map({ length: 3 }, (_, index) => {
			const label = `resource ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		const soapResponse = getCustomResources(items);

		setupBackendResponse([items[0]]);

		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await act(async () => {
			await user.type(screen.getByText('Meeting room'), 'resource');
		});

		act(() => {
			jest.runOnlyPendingTimers();
		});

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		await act(async () => {
			await user.keyboard('[Enter]');
		});
		expect(dropdown).not.toBeInTheDocument();
		expect(screen.getByText(/resource 0/i)).toBeVisible();
	});
});
