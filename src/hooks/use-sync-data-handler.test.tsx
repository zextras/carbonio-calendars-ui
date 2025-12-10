/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { SoapNotify } from '@zextras/carbonio-shell-ui';
import { folderWorker } from '@zextras/carbonio-ui-commons';

import { useSyncDataHandler } from './use-sync-data-handler';
import { reducers } from '../store/redux';
import { useCalendarGroupStore } from '../store/zustand/calendar-group-store';
import mockedData from '../test/generators';
import { setupHook } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { mockSoapSync } from '@test-utils/utils/soap';

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	folderWorker: {
		postMessage: vi.fn()
	},
	tagsWorker: {
		postMessage: vi.fn()
	}
}));

describe('sync data handler', () => {
	describe('folders', () => {
		test('it will invoke the folders worker when a folders related notify is received', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			populateFoldersStore();
			const notify = { deleted: ['15'], seq: 0 };
			const workerSpy = vi.spyOn(folderWorker, 'postMessage');

			mockSoapSync([notify]);

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
							}
						]
					},
					deleted: [],
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

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
							},
							{
								view: 'calendar_group',
								id: '134',
								name: 'test group',
								meta: [{ _attrs: { cids: '10#15' } }]
							}
						]
					},
					deleted: [],
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

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
							}
						]
					},
					deleted: [],
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

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
				// Reset calendar group state to ensure test isolation.
				// This prevents state leakage between tests and avoids future regressions if test setup changes.
				const emptyStore = mockedData.store.mockReduxStore();
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
				useCalendarGroupStore.setState({ groups: {} });
				populateFoldersStore();
				const notify = {
					created: {
						folder: [mockedData.calendars.getCalendar()]
					},
					deleted: [],
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({});
			});
		});
		describe('deleted', () => {
			test('it will remove the group from the store', () => {
				const emptyStore = mockedData.store.mockReduxStore();
				const store = configureStore({
					reducer: combineReducers(reducers),
					preloadedState: emptyStore
				});
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
				mockSoapSync([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({});
			});
		});
		describe('modified', () => {
			test('it wont replace the old store', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				useCalendarGroupStore.setState({
					groups: {
						150: {
							id: '150',
							name: 'test group 1',
							calendarId: ['10', '20']
						},
						134: {
							name: 'test group 1',
							calendarId: ['10', '20'],
							id: '134'
						}
					}
				});
				populateFoldersStore();
				const notify = {
					modified: {
						folder: [
							{
								id: '134',
								name: 'new test group 1',
								meta: [{ _attrs: { cids: '10#20' }, section: 'calendarIds' }]
							}
						]
					},
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual(
					expect.objectContaining({
						150: {
							id: '150',
							name: 'test group 1',
							calendarId: ['10', '20']
						}
					})
				);
			});
			test('it will rename the group', () => {
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
					modified: {
						folder: [
							{
								id: '134',
								name: 'new test group 1',
								meta: [{ _attrs: { cids: '10#20' }, section: 'calendarIds' }]
							}
						]
					},
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({
					134: {
						name: 'new test group 1',
						calendarId: ['10', '20'],
						id: '134'
					}
				});
			});
			test('it will change the calendarIds', () => {
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
					modified: {
						folder: [
							{
								id: '134',
								name: 'test group 1',
								meta: [{ _attrs: { cids: '10#15' }, section: 'calendarIds' }]
							}
						]
					},
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({
					134: {
						name: 'test group 1',
						calendarId: ['10', '15'],
						id: '134'
					}
				});
			});
			test('it will change the calendarIds as empty array if empty string is received', () => {
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
					modified: {
						folder: [
							{
								id: '134',
								name: 'test group 1',
								meta: [{ _attrs: { cids: '' }, section: 'calendarIds' }]
							}
						]
					},
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({
					134: {
						name: 'test group 1',
						calendarId: [],
						id: '134'
					}
				});
			});
			test('it will rename the group and change the calendarIds', () => {
				const store = configureStore({ reducer: combineReducers(reducers) });
				useCalendarGroupStore.setState({
					groups: {
						134: {
							name: 'new test group 1',
							calendarId: ['10', '20'],
							id: '134'
						}
					}
				});
				populateFoldersStore();
				const notify = {
					modified: {
						folder: [
							{
								id: '134',
								name: 'new test group 1',
								meta: [{ _attrs: { cids: '10#15' }, section: 'calendarIds' }]
							}
						]
					},
					seq: 0
				} as unknown as SoapNotify;
				mockSoapSync([notify]);

				setupHook(useSyncDataHandler, { store });

				expect(useCalendarGroupStore.getState().groups).toEqual({
					134: {
						name: 'new test group 1',
						calendarId: ['10', '15'],
						id: '134'
					}
				});
			});
		});
	});
});
