/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, waitFor, within } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { http, HttpResponse } from 'msw';

import { generateEditor } from '../../../../commons/editor-generator';
import { TEST_SELECTORS } from '../../../../constants/test-utils';
import { mockFreeBusyResponse } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { getCustomResources } from '../../../../test/mocks/network/msw/handle-autocomplete-gal-request';
import { EditorMeetingRooms } from '../editor-meeting-rooms';
import { getSetupServer } from '@jest-setup';
import { setupTest } from '@test-setup';
import { buildSoapErrorResponseBody } from '@test-utils/utils/soap';

describe('Editor meeting rooms', () => {
	it('should display the Meeting room input on the screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

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
			await vi.advanceTimersToNextTimerAsync();
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
			await vi.advanceTimersToNextTimerAsync();
		});

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		await user.click(within(dropdown).getByText(items[0].label));
		expect(dropdown).not.toBeInTheDocument();
		await act(async () => {
			await vi.advanceTimersToNextTimerAsync();
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
		const dropDownItems = await screen.findAllByTestId('dropdown-item');

		await user.keyboard('{Control>}{Enter}{/Control}');

		expect(dropDownItems[0]).not.toBeInTheDocument();
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
		const soapResponse = getCustomResources(items);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'location');
		const dropDownItems = await screen.findAllByTestId('dropdown-item');

		const selectedMeetingRoomLabel = items[0].label;
		await user.click(within(dropDownItems[0]).getByText(selectedMeetingRoomLabel));

		expect(screen.getByText(meetinRoom1.label)).toBeVisible();
		expect(screen.getByText(selectedMeetingRoomLabel)).toBeVisible();
	});

	it('should allow adding a new chip that have the same label', async () => {
		const label = `location 1`;
		const itemFromAutoComplete = {
			id: faker.string.uuid(),
			label,
			value: label,
			email: '',
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
		const soapResponse = getCustomResources([itemFromAutoComplete]);
		mockFreeBusyResponse([]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'location');

		const dropdown = await screen.findByTestId('dropdown-item');
		await user.click(within(dropdown).getByText(itemFromAutoComplete.label));
		expect(dropdown).not.toBeInTheDocument();

		expect((await screen.findAllByText(label)).length).toBe(2);
	});

	it('should allow adding multiple chips with the same email', async () => {
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

		mockFreeBusyResponse([]);
		const soapResponse = getCustomResources([itemFromAutoComplete]);
		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => HttpResponse.json(soapResponse))
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'meeting');
		const dropDownItem = await screen.findByTestId('dropdown-item');
		await user.click(within(dropDownItem).getByText(itemFromAutoComplete.label));

		expect(dropDownItem).not.toBeInTheDocument();

		expect((await screen.findAllByText(storedItem.label)).length).toBe(1);
		expect(screen.queryAllByText(itemFromAutoComplete.label).length).toBe(1);
	});

	it('should leave options dropdown open with loader when AutoCompleteGal api fails with 500', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [] }
		});

		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => {
				await new Promise((resolve) => {
					setTimeout(resolve, 1000);
				});
				return new HttpResponse(null, { status: 500 });
			})
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'location');

		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		expect(await within(dropdown).findByTestId('dropdown-options-loader')).toBeVisible();
	});

	it('should leave options dropdown open with loader when call to AutoCompleteGal api fails with Soap Fault', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {}, meetingRoom: [] }
		});

		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () => {
				await new Promise((resolve) => {
					setTimeout(resolve, 1000);
				});
				return HttpResponse.json<ErrorSoapBodyResponse>(buildSoapErrorResponseBody());
			})
		);

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		await user.type(screen.getByText('Meeting room'), 'location');
		const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);

		expect(await within(dropdown).findByTestId('dropdown-options-loader')).toBeVisible();
	});

	it('should handle API failure when searching for meeting rooms', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({
			context: { dispatch: store.dispatch, folders: {} }
		});

		getSetupServer().use(
			http.post('/service/soap/AutoCompleteGalRequest', async () =>
				HttpResponse.json(buildSoapErrorResponseBody())
			)
		);

		const consoleSpy = vi.spyOn(console, 'warn');
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await user.type(screen.getByText('Meeting room'), 'test');

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'API failed'
				})
			);
		});
		consoleSpy.mockRestore();
	});
});
