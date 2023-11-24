/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import { map, values } from 'lodash';
import moment from 'moment';
import { rest } from 'msw';

import { EditorMeetingRooms } from './editor-meeting-rooms';
import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { generateRoots } from '../../../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { FolderView } from '../../../carbonio-ui-commons/types/folder';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_RESOURCES } from '../../../constants';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar';
import { reducers } from '../../../store/redux';
import { useAppStatusStore } from '../../../store/zustand/store';
import mockedData from '../../../test/generators';
import { handleGetFreeBusyCustomResponse } from '../../../test/mocks/network/msw/handle-get-free-busy';
import { Resource } from '../../../types/editor';

const roots = generateRoots();

const folder = {
	absFolderPath: '/Calendar 1',
	id: '10',
	l: SIDEBAR_ITEMS.ALL_CALENDAR,
	name: 'Calendar 1',
	owner: 'random owner',
	view: 'appointment' as FolderView,
	n: 1,
	uuid: 'abcd',
	recursive: false,
	deletable: false,
	activesyncdisabled: true,
	isLink: true,
	depth: 1,
	children: [],
	reminder: false,
	broken: false,
	acl: {
		grant: []
	}
};

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		roots: {
			...roots,
			USER: {
				...roots.USER,
				children: [folder]
			}
		},
		folders: { [folder.id]: folder }
	}));
};

const setupEmptyAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ resources: [] }));
};

const setupFilledAppStatusStore = (items: Array<Resource>): void => {
	useAppStatusStore.setState(() => ({
		resources: items
	}));
};

const MEETING_ROOM = 'Meeting room';

const setupBackendResponse = (
	items: { id: string; label: string; value: string; email: string; type: string }[]
): void => {
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
		rest.post('/service/soap/GetFreeBusyRequest', (req, res, ctx) => res(ctx.json(response)))
	);
};

describe('editor meeting rooms', () => {
	test('The component is visible on screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });

		setupEmptyAppStatusStore();
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});

		const meetingRoomSelector = screen.getByText(MEETING_ROOM);
		expect(meetingRoomSelector).toBeInTheDocument();
	});

	test('On single selection the redux store value is updated', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });
		const items = map({ length: 3 }, () => {
			const label = faker.commerce.productName();
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		setupFilledAppStatusStore(items);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		setupBackendResponse(items);

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});

		await waitFor(() => {
			user.click(screen.getByText(items[0].label));
		});

		const updatedEditor = values(store.getState().editor.editors)[0];

		expect(updatedEditor.meetingRoom).toStrictEqual([items[0]]);
	});

	test('On multiple selection the redux store value is updated', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });
		const items = map({ length: 3 }, () => {
			const label = faker.commerce.productName();
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		setupFilledAppStatusStore(items);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		setupBackendResponse(items);

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});
		await waitFor(() => {
			user.click(screen.getByText(items[0].label));
		});
		await user.click(screen.getByText(items[1].label));
		const updatedEditor = values(store.getState().editor.editors)[0];

		expect(updatedEditor.meetingRoom).toStrictEqual([items[0], items[1]]);
	});

	test('On all selection the redux store value is updated with all rooms', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });
		const items = map({ length: 3 }, () => {
			const label = faker.commerce.productName();
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		setupFilledAppStatusStore(items);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		setupBackendResponse(items);

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});

		await waitFor(() => {
			user.click(screen.getByText('All'));
		});
		const updatedEditor = values(store.getState().editor.editors)[0];

		expect(updatedEditor.meetingRoom).toStrictEqual(items);
	});

	test('clicking an already selected room will deselect it', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });
		const items = map({ length: 3 }, () => {
			const label = faker.commerce.productName();
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		setupFilledAppStatusStore(items);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		setupBackendResponse(items);

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});

		await waitFor(() => {
			user.click(screen.getByText(items[0].label));
		});

		await user.click(within(screen.getByTestId('dropdown-popper-list')).getByText(items[0].label));

		const updatedEditor = values(store.getState().editor.editors)[0];

		expect(updatedEditor.meetingRoom).toStrictEqual([]);
	});

	test('default meeting room selection is visible on screen', async () => {
		setupFoldersStore();
		const store = configureStore({ reducer: combineReducers(reducers) });
		const items = map({ length: 3 }, () => {
			const label = faker.commerce.productName();
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({
			context: {
				attendees: map(items, (room) => ({
					d: room.label,
					ptst: 'AC',
					role: 'REQ',
					url: '',
					rsvp: true,
					a: room.email,
					cutype: CALENDAR_RESOURCES.ROOM
				}))
			},
			event
		});
		const editor = generateEditor({
			event,
			invite,
			context: { dispatch: store.dispatch, folders: [folder] }
		});

		setupFilledAppStatusStore(items);
		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		setupBackendResponse(items);

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});

		expect(
			screen.getByText(`${items[0].label}, ${items[1].label}, ${items[2].label}`)
		).toBeInTheDocument();
	});
	test('if a meeting room is busy the select option will show a red triangle icon', async () => {
		setupFoldersStore();

		const busyStart = moment().add(5, 'hours').valueOf();
		const busyEnd = moment().add(5, 'hours').add(30, 'minutes').valueOf();

		const items = map({ length: 3 }, () => {
			const label = faker.commerce.productName();
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});

		setupFilledAppStatusStore(items);

		const store = configureStore({ reducer: combineReducers(reducers) });

		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({
			context: {
				attendees: map(items, (room) => ({
					d: room.label,
					ptst: 'AC',
					role: 'REQ',
					url: '',
					rsvp: true,
					a: room.email,
					cutype: CALENDAR_RESOURCES.ROOM
				}))
			},
			event
		});

		const editor = generateEditor({
			event,
			invite,
			context: { dispatch: store.dispatch, folders: [folder], start: busyStart, end: busyEnd }
		});

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		const freeBusyArrayItems = map(items, (item, index) => {
			if (index === 0) {
				return {
					id: item.email,
					f: [
						{
							s: moment().startOf('day').valueOf(),
							e: moment().add(5, 'hours').valueOf()
						},
						{
							s: moment().add(5, 'hours').add(30, 'minutes').valueOf(),
							e: moment().endOf('day').valueOf()
						}
					],
					b: [
						{
							s: busyStart,
							e: busyEnd
						}
					]
				};
			}
			return {
				id: item.email,
				f: [
					{
						s: moment().startOf('day').valueOf(),
						e: moment().endOf('day').valueOf()
					}
				]
			};
		});

		const response2 = handleGetFreeBusyCustomResponse(freeBusyArrayItems);

		getSetupServer().use(
			rest.post('/service/soap/GetFreeBusyRequest', (req, res, ctx) => res(ctx.json(response2)))
		);

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});

		expect(screen.getByTestId('icon: AlertTriangle')).toBeInTheDocument();
	});
	test('if a meeting room is not busy the select option wont show any red triangle icon', async () => {
		setupFoldersStore();

		const items = map({ length: 3 }, () => {
			const label = faker.commerce.productName();
			return {
				id: faker.datatype.uuid(),
				label,
				value: label,
				email: faker.internet.email(),
				type: 'Location'
			};
		});

		setupFilledAppStatusStore(items);

		const store = configureStore({ reducer: combineReducers(reducers) });

		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({
			context: {
				attendees: map(items, (room) => ({
					d: room.label,
					ptst: 'AC',
					role: 'REQ',
					url: '',
					rsvp: true,
					a: room.email,
					cutype: CALENDAR_RESOURCES.ROOM
				}))
			},
			event
		});

		const editor = generateEditor({
			event,
			invite,
			context: { dispatch: store.dispatch, folders: [folder] }
		});

		const { user } = setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		setupBackendResponse(items);

		await waitFor(() => {
			user.click(screen.getByText(MEETING_ROOM));
		});

		expect(screen.queryByTestId('icon: AlertTriangle')).not.toBeInTheDocument();
	});
});
