/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { SoapFolder } from '@zextras/carbonio-shell-ui';

import { useNotify } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../carbonio-ui-commons/test/test-setup';
import { folderWorker } from '../../../carbonio-ui-commons/worker';
import { reducers } from '../../../store/redux';
import { useCalendarGroupStore } from '../../../store/zustand/calendar-group-store';
import mockedData from '../../../test/generators';
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
	describe('calendar groups', () => {
		describe('created', () => {
			test('it will add the new group to the store', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				useCalendarGroupStore.setState((state) => state);
				populateFoldersStore();
				const notify = {
					created: {
						folder: [
							{
								view: 'calendar_group',
								id: '134',
								name: 'test group',
								meta: [{ _attrs: { cids: '10#15' } }]
							} as unknown as SoapFolder
						]
					},
					deleted: [],
					seq: 0
				};
				useNotify.mockReturnValueOnce([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({
					134: {
						id: '134',
						name: 'test group',
						calendarId: ['10', '15']
					}
				});
			});
			test('it will add all the new groups to the store', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				useCalendarGroupStore.setState((state) => state);
				populateFoldersStore();
				const notify = {
					created: {
						folder: [
							{
								view: 'calendar_group',
								id: '150',
								name: 'test group 1',
								meta: [{ _attrs: { cids: '10#20' } }]
							} as unknown as SoapFolder,
							{
								view: 'calendar_group',
								id: '134',
								name: 'test group',
								meta: [{ _attrs: { cids: '10#15' } }]
							} as unknown as SoapFolder
						]
					},
					deleted: [],
					seq: 0
				};
				useNotify.mockReturnValueOnce([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({
					150: {
						id: '150',
						name: 'test group 1',
						calendarId: ['10', '20']
					},
					134: {
						id: '134',
						name: 'test group',
						calendarId: ['10', '15']
					}
				});
			});
			test('it wont cancel the other groups', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				useCalendarGroupStore.setState({
					groups: {
						150: {
							id: '150',
							name: 'test group 1',
							calendarId: ['10', '20']
						}
					}
				});
				populateFoldersStore();
				const notify = {
					created: {
						folder: [
							{
								view: 'calendar_group',
								id: '134',
								name: 'test group 2',
								meta: [{ _attrs: { cids: '10#15' } }]
							} as unknown as SoapFolder
						]
					},
					deleted: [],
					seq: 0
				};
				useNotify.mockReturnValueOnce([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({
					150: {
						id: '150',
						name: 'test group 1',
						calendarId: ['10', '20']
					},
					134: {
						id: '134',
						name: 'test group 2',
						calendarId: ['10', '15']
					}
				});
			});
			test('it wont add folders to the groups', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				useCalendarGroupStore.setState((state) => state);
				populateFoldersStore();
				const notify = {
					created: {
						folder: [mockedData.calendars.getCalendar()]
					} as unknown as SoapFolder,
					deleted: [],
					seq: 0
				};
				useNotify.mockReturnValueOnce([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({});
			});
		});
		describe('deleted', () => {
			test('it will remove the group from the store', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				useCalendarGroupStore.setState({
					groups: {
						134: {
							name: 'test group 1',
							calendarId: ['10', '20'],
							id: '134'
						}
					}
				});
				populateFoldersStore();
				const notify = {
					deleted: ['134'],
					seq: 0
				};
				useNotify.mockReturnValueOnce([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({});
			});
		});
	});
});
