/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, within } from '@testing-library/react';
import { getSetupServer } from '@zextras/carbonio-ui-commons';
import { map } from 'lodash';
import { http, HttpResponse } from 'msw';

import { generateEditor } from '../../../../commons/editor-generator';
import { TEST_SELECTORS } from '../../../../constants/test-utils';
import { mockFreeBusyResponse } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { useAppStatusStore } from '../../../../store/zustand/store';
import { getCustomResources } from '../../../../test/mocks/network/msw/handle-autocomplete-gal-request';
import { EditorMeetingRooms } from '../editor-meeting-rooms';
import { setupTest } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '@test-utils/utils/soap';

const setupEmptyAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ meetingRoom: [] }));
};

describe('Editor meeting rooms', () => {
	it('should display the Meeting room input on the screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

		setupEmptyAppStatusStore();
		setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		expect(screen.getByText('Meeting room')).toBeInTheDocument();
	});
	it('should render the chip when present in the store', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const meetingRoom1 = {
			label: 'meeting room 1',
			email: 'meeting@room1.test'
		};

		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [meetingRoom1] }
		});

		setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		expect(screen.getByText(meetingRoom1.label)).toBeVisible();
	});
	it('should display meeting room busy when is already booked', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const meetingRoom1 = {
			label: 'meeting room 1',
			email: 'meeting@room1.test'
		};
		const start = new Date(2024, 1, 10, 11, 0).getTime();
		const end = new Date(2024, 1, 10, 12, 0).getTime();
		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				start,
				end,
				meetingRoom: [meetingRoom1]
			}
		});
		const freeBusyInterceptor = mockFreeBusyResponse([
			{
				id: meetingRoom1.email,
				b: [{ s: start, e: end }]
			}
		]);

		setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		await freeBusyInterceptor;

		expect(screen.getByText(meetingRoom1.label)).toBeVisible();
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
				type: 'Location'
			};
		});
		const soapResponse = getCustomResources(items);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'resource');

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
				type: 'Location'
			};
		});
		const soapResponse = getCustomResources(items);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'resource');

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
				type: 'Location'
			};
		});
		const soapResponse = getCustomResources(items);
		mockFreeBusyResponse([]);

		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'resource');

		await act(async () => {
			await jest.advanceTimersToNextTimerAsync();
		});

		const dropdown = screen.getByTestId(TEST_SELECTORS.DROPDOWN);

		await user.keyboard('[Enter]');

		await act(async () => {
			await jest.advanceTimersToNextTimerAsync();
		});

		expect(dropdown).not.toBeInTheDocument();
		expect(screen.getByText(/resource 0/i)).toBeVisible();
	});
	it('should not remove the already existing chips when adding a new one', async () => {
		const meetinRoom1 = {
			label: 'meeting room 1',
			email: 'meeting@room1.test'
		};
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [meetinRoom1] }
		});
		const items = map({ length: 3 }, (_, index) => {
			const label = `location ${index}`;
			return {
				id: faker.string.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		const handler = getCustomResources(items);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(handler))
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'location');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		const selectedMeetingRoomLabel = items[0].label;
		await user.click(within(dropdown).getByText(selectedMeetingRoomLabel));

		expect(screen.getByText(meetinRoom1.label)).toBeVisible();
		expect(screen.getByText(selectedMeetingRoomLabel)).toBeVisible();
	});
	it('should not add a new chip that have the same label', async () => {
		const label = `location 1`;
		const itemFromAutoComplete = {
			id: faker.string.uuid(),
			label,
			value: label,
			email: 'location1@test.it',
			type: 'Location'
		};
		const storedItem = {
			label,
			email: 'differentlocation@test.it'
		};
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [storedItem] }
		});
		const handler = getCustomResources([itemFromAutoComplete]);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(handler))
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'location');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await user.click(within(dropdown).getByText(itemFromAutoComplete.label));

		expect((await screen.findAllByText(label)).length).toBe(1);
	});
	it('should not display multiple chips with the same email', async () => {
		const email = `same@email.it`;
		const itemFromAutoComplete = {
			id: faker.string.uuid(),
			label: 'meeting room 1',
			value: 'meeting room 1',
			email,
			type: 'Location'
		};
		const storedItem = {
			label: 'meeting room 2',
			email
		};
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [storedItem] }
		});
		const handler = getCustomResources([itemFromAutoComplete]);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(handler))
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'meeting');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await user.click(within(dropdown).getByText(itemFromAutoComplete.label));

		expect(dropdown).not.toBeInTheDocument();

		expect((await screen.findAllByText(storedItem.label)).length).toBe(1);
		expect(screen.queryAllByText(itemFromAutoComplete.label).length).toBe(0);
	});
	it('should leave options dropdown open with loader when call to AutoCompleteGal api fails with generic 500', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [] }
		});

		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.error())
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		await user.type(screen.getByText('Meeting room'), 'location');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		expect(within(dropdown).getByTestId('dropdown-options-loader')).toBeVisible();
	});
	it('should leave options dropdown open with loader when call to AutoCompleteGal api fails with Soap Fault', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [] }
		});

		const interceptor = createSoapAPIInterceptor('AutoCompleteGal', buildSoapErrorResponseBody());

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		await user.type(screen.getByText('Meeting room'), 'location');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
		await interceptor;

		expect(within(dropdown).getByTestId('dropdown-options-loader')).toBeVisible();
	});
});
