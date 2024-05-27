/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';

import { EditorResourcesController } from './editor-resources-controller';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_RESOURCES } from '../../../constants';
import { PARTICIPANT_ROLE } from '../../../constants/api';
import * as searchResourcesHandler from '../../../soap/search-calendar-resources-request';
import { reducers } from '../../../store/redux';
import { useAppStatusStore } from '../../../store/zustand/store';
import mockedData from '../../../test/generators';

const setupAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ meetingRoom: undefined, equipment: undefined }));
};

describe('editor resources controller', () => {
	test("if the event doesn't have meeting rooms or equipments the controller does not make any call", async () => {
		const searchResourcesSpy = jest.spyOn(searchResourcesHandler, 'searchCalendarResourcesRequest');
		setupAppStatusStore();
		const store = configureStore({ reducer: combineReducers(reducers) });
		const context = { folders: {}, dispatch: store.dispatch };
		const editor = generateEditor({ context });
		await act(async () => {
			await setupTest(<EditorResourcesController editorId={editor.id} />, { store });
		});
		const state = useAppStatusStore.getState();
		expect(state.meetingRoom).toBeUndefined();
		expect(state.equipment).toBeUndefined();
		expect(searchResourcesSpy).not.toHaveBeenCalled();
	});
	test('if the event have meeting rooms the controller will make a call asking meeting rooms', async () => {
		const searchResourcesSpy = jest.spyOn(searchResourcesHandler, 'searchCalendarResourcesRequest');
		setupAppStatusStore();
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent({
			resource: {
				isRecurrent: true,
				ridZ: undefined
			}
		});
		const location = 'location@location.com';
		const invite = mockedData.getInvite({
			event,
			context: {
				attendees: [
					{
						a: location,
						d: 'location',
						cutype: CALENDAR_RESOURCES.ROOM,
						ptst: 'NE',
						role: PARTICIPANT_ROLE.NON_PARTICIPANT,
						rsvp: true,
						url: location
					}
				],
				participants: {
					NE: [
						{
							name: 'location',
							email: location,
							isOptional: false,
							response: 'NE',
							cutype: CALENDAR_RESOURCES.ROOM
						}
					]
				}
			}
		});
		const folder = mockedData.calendars.defaultCalendar;
		const context = { folders: { [folder.id]: folder }, dispatch: store.dispatch };

		const editor = generateEditor({ event, invite, context });
		await act(async () => {
			await setupTest(<EditorResourcesController editorId={editor.id} />, { store });
		});
		const state = useAppStatusStore.getState();
		expect(state.meetingRoom).toBeDefined();
		expect(state.equipment).toBeUndefined();
		expect(searchResourcesSpy).toHaveBeenCalledTimes(1);
		expect(searchResourcesSpy).toHaveBeenCalledWith('Location');
	});
	test('if the event have equipments the controller will make a call asking equipments', async () => {
		const searchResourcesSpy = jest.spyOn(searchResourcesHandler, 'searchCalendarResourcesRequest');
		setupAppStatusStore();
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent({
			resource: {
				isRecurrent: true,
				ridZ: undefined
			}
		});
		const equipment = 'equipment@equipment.com';
		const invite = mockedData.getInvite({
			event,
			context: {
				attendees: [
					{
						a: equipment,
						d: 'equipment',
						cutype: CALENDAR_RESOURCES.RESOURCE,
						ptst: 'NE',
						role: PARTICIPANT_ROLE.NON_PARTICIPANT,
						rsvp: true,
						url: equipment
					}
				],
				participants: {
					NE: [
						{
							name: 'equipment',
							email: equipment,
							isOptional: false,
							response: 'NE',
							cutype: CALENDAR_RESOURCES.RESOURCE
						}
					]
				}
			}
		});
		const folder = mockedData.calendars.defaultCalendar;
		const context = { folders: { [folder.id]: folder }, dispatch: store.dispatch };

		const editor = generateEditor({ event, invite, context });
		await act(async () => {
			await setupTest(<EditorResourcesController editorId={editor.id} />, { store });
		});
		const state = useAppStatusStore.getState();
		expect(state.equipment).toBeDefined();
		expect(state.meetingRoom).toBeUndefined();
		expect(searchResourcesSpy).toHaveBeenCalledTimes(1);
		expect(searchResourcesSpy).toHaveBeenCalledWith('Equipment');
	});
	test('if the event has both meeting rooms and equipments the controller will make 2 different calls', async () => {
		const searchResourcesSpy = jest.spyOn(searchResourcesHandler, 'searchCalendarResourcesRequest');
		setupAppStatusStore();
		const store = configureStore({ reducer: combineReducers(reducers) });
		const event = mockedData.getEvent({
			resource: {
				isRecurrent: true,
				ridZ: undefined
			}
		});
		const location = 'location@location.com';
		const equipment = 'equipment@equipment.com';
		const invite = mockedData.getInvite({
			event,
			context: {
				attendees: [
					{
						a: location,
						d: 'location',
						cutype: CALENDAR_RESOURCES.ROOM,
						ptst: 'NE',
						role: PARTICIPANT_ROLE.NON_PARTICIPANT,
						rsvp: true,
						url: location
					},
					{
						a: equipment,
						d: 'equipment',
						cutype: CALENDAR_RESOURCES.RESOURCE,
						ptst: 'NE',
						role: PARTICIPANT_ROLE.NON_PARTICIPANT,
						rsvp: true,
						url: equipment
					}
				],
				participants: {
					NE: [
						{
							name: 'location',
							email: location,
							isOptional: false,
							response: 'NE',
							cutype: CALENDAR_RESOURCES.ROOM
						},
						{
							name: 'equipment',
							email: equipment,
							isOptional: false,
							response: 'NE',
							cutype: CALENDAR_RESOURCES.RESOURCE
						}
					]
				}
			}
		});
		const folder = mockedData.calendars.defaultCalendar;
		const context = { folders: { [folder.id]: folder }, dispatch: store.dispatch };

		const editor = generateEditor({ event, invite, context });
		await act(async () => {
			await setupTest(<EditorResourcesController editorId={editor.id} />, { store });
		});
		const state = useAppStatusStore.getState();
		expect(state.equipment).toBeDefined();
		expect(state.meetingRoom).toBeDefined();
		expect(searchResourcesSpy).toHaveBeenCalledTimes(2);
		expect(searchResourcesSpy).toHaveBeenCalledWith('Equipment');
		expect(searchResourcesSpy).toHaveBeenCalledWith('Location');
	});
});
