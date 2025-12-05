/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, render, screen, within } from '@testing-library/react';
import { HttpResponse } from 'msw';

import * as shell from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import { EditorPanel } from '../editor-panel';
import { defaultEditor } from './common';
import { abortSpy } from '@jest-setup';
import { setupTest, UserEvent } from '@test-setup';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';

describe('Editor panel', () => {
	describe('cleanup', () => {
		it('should abort the request when the component re-renders', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			shell.getBridgedFunctions.mockImplementation(() => ({
				createSnackbar: vi.fn()
			}));

			generateEditor({
				context: {
					folders: {},
					dispatch: store.dispatch,
					...defaultEditor
				}
			});

			let upTest: { user: UserEvent } & ReturnType<typeof render>;

			await act(async () => {
				upTest = setupTest(<EditorPanel editorId={defaultEditor.id} />, { store });
			});

			// eslint-disable-next-line testing-library/no-unnecessary-act
			await act(async () => {
				upTest.rerender(<div />); // Force cleanup of useEffect
			});

			expect(abortSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('resource handling', () => {
		it('should show the loading spinner when equipments are being fetched', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			shell.getBridgedFunctions.mockImplementation(() => ({
				createSnackbar: vi.fn()
			}));

			generateEditor({
				context: {
					folders: {},
					dispatch: store.dispatch,
					...defaultEditor
				}
			});

			createSoapAPIInterceptor('SearchCalendarResources', {
				paginationSupported: true,
				calresource: [],
				sortBy: 'dateDesc',
				offset: 0,
				more: false,
				_jsns: 'urn:zimbraAccount'
			});

			setupTest(<EditorPanel editorId={defaultEditor.id} />, { store });

			expect(
				screen.getByText(/Loading “Meeting room” and “Equipment”, please wait.../i)
			).toBeInTheDocument();
		});

		it('shows the equipments input field when API returns valid equipments resource', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			shell.getBridgedFunctions.mockImplementation(() => ({
				createSnackbar: vi.fn()
			}));

			generateEditor({
				context: {
					folders: {},
					dispatch: store.dispatch,
					...defaultEditor
				}
			});

			createSoapAPIInterceptor('SearchCalendarResources', {
				paginationSupported: true,
				calresource: [
					{
						name: 'equipment@equipment.com',
						id: 'c36af978-7a71-4ab4-8b1c-81013a768e0b',
						_attrs: {
							zimbraCalResType: 'Equipment',
							fullName: 'equipment',
							email: 'equipment@equipment.com'
						}
					}
				],
				sortBy: 'dateDesc',
				offset: 0,
				more: false,
				_jsns: 'urn:zimbraAccount'
			});

			await act(async () => {
				setupTest(<EditorPanel editorId={defaultEditor.id} />, { store });
			});

			const editorPanel = await screen.findByTestId('EditorPanel');
			expect(editorPanel).toBeInTheDocument();
			expect(
				within(editorPanel).getByRole('textbox', {
					name: /equipment/i
				})
			).toBeInTheDocument();
		});

		it('shows the meeting room input field when API returns valid Locations resource', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			shell.getBridgedFunctions.mockImplementation(() => ({
				createSnackbar: vi.fn()
			}));

			generateEditor({
				context: {
					folders: {},
					dispatch: store.dispatch,
					...defaultEditor
				}
			});

			createSoapAPIInterceptor('SearchCalendarResources', {
				paginationSupported: true,
				calresource: [
					{
						name: 'meeting@meeting.com',
						id: 'c36af978-7a71-4ab4-8b1c-81013a768e0b',
						_attrs: {
							zimbraCalResType: 'Location',
							fullName: 'meeting',
							email: 'meeting@meeting.com'
						}
					}
				],
				sortBy: 'dateDesc',
				offset: 0,
				more: false,
				_jsns: 'urn:zimbraAccount'
			});

			await act(async () => {
				setupTest(<EditorPanel editorId={defaultEditor.id} />, { store });
			});

			const editorPanel = await screen.findByTestId('EditorPanel');
			expect(editorPanel).toBeInTheDocument();
			expect(
				within(editorPanel).getByRole('textbox', {
					name: /location/i
				})
			).toBeInTheDocument();
		});

		it('should hide meeting room and equipment input fields when no resources are available', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			shell.getBridgedFunctions.mockImplementation(() => ({
				createSnackbar: vi.fn()
			}));

			generateEditor({
				context: {
					folders: {},
					dispatch: store.dispatch,
					...defaultEditor
				}
			});

			createSoapAPIInterceptor('SearchCalendarResources', {
				paginationSupported: true,
				calresource: [],
				sortBy: 'dateDesc',
				offset: 0,
				more: false,
				_jsns: 'urn:zimbraAccount'
			});

			await act(async () => {
				setupTest(<EditorPanel editorId={defaultEditor.id} />, { store });
			});

			const editorPanel = await screen.findByTestId('EditorPanel');
			expect(editorPanel).toBeInTheDocument();
			expect(
				within(editorPanel).queryByRole('textbox', {
					name: /equipment/i
				})
			).not.toBeInTheDocument();
			expect(
				within(editorPanel).queryByRole('textbox', {
					name: /meeting room/i
				})
			).not.toBeInTheDocument();
		});
	});

	it('should show error message if the fetch resources fails', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		shell.getBridgedFunctions.mockImplementation(() => ({
			createSnackbar: vi.fn()
		}));

		generateEditor({
			context: {
				folders: {},
				dispatch: store.dispatch,
				...defaultEditor
			}
		});

		createAPIInterceptor(
			'post',
			'/service/soap/SearchCalendarResourcesRequest',
			HttpResponse.error()
		);

		await act(async () => {
			setupTest(<EditorPanel editorId={defaultEditor.id} />, { store });
		});

		expect(
			screen.getByText(
				"Couldn't load “Meeting room” and “Equipment”. Try closing and reopening the board."
			)
		).toBeInTheDocument();
	});
});
