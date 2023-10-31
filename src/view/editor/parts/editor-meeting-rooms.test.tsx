/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, within } from '@testing-library/react';
import { map, values } from 'lodash';

import { EditorMeetingRooms } from './editor-meeting-rooms';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_RESOURCES } from '../../../constants';
import { reducers } from '../../../store/redux';
import { useAppStatusStore } from '../../../store/zustand/store';
import mockedData from '../../../test/generators';
import { MeetingRoom } from '../../../types/editor';

const setupEmptyAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ resources: [] }));
};

const setupFilledAppStatusStore = (items: Array<MeetingRoom>): void => {
	useAppStatusStore.setState(() => ({
		resources: items
	}));
};

describe('editor meeting rooms', () => {
	test('The component is visible on screen', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });

		setupEmptyAppStatusStore();
		setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });
		const meetingRoomSelector = await screen.findByText('Meeting room');
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
		await user.click(screen.getByText('Meeting room'));

		await user.click(screen.getByText(items[0].label));
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
		await user.click(screen.getByText('Meeting room'));

		await user.click(screen.getByText(items[0].label));
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
		await user.click(screen.getByText('Meeting room'));

		await user.click(screen.getByText('All'));
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
		await user.click(screen.getByText('Meeting room'));

		await user.click(screen.getByText(items[0].label));
		await user.click(within(screen.getByTestId('dropdown-popper-list')).getByText(items[0].label));

		const updatedEditor = values(store.getState().editor.editors)[0];

		expect(updatedEditor.meetingRoom).toStrictEqual([]);
	});

	test('default meeting room selection is visible on screen', async () => {
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
			context: { dispatch: store.dispatch, folders: [] }
		});

		setupFilledAppStatusStore(items);
		setupTest(<EditorMeetingRooms editorId={editor.id} />, { store });

		expect(
			screen.getByText(`${items[0].label}, ${items[1].label}, ${items[2].label}`)
		).toBeInTheDocument();
	});
});
