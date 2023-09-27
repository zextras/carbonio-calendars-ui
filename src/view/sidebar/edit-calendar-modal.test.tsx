/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import { find } from 'lodash';
import { rest } from 'msw';

import { EditModal } from './edit-modal/edit-modal';
import { useFolderStore } from '../../carbonio-ui-commons/store/zustand/folder';
import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { generateRoots } from '../../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { setupTest, setupHook } from '../../carbonio-ui-commons/test/test-setup';
import type { FolderView } from '../../carbonio-ui-commons/types/folder';
import { useCalendarActions } from '../../hooks/use-calendar-actions';
import { reducers } from '../../store/redux';

const roots = generateRoots();

const folder = {
	absFolderPath: '/calendar 1',
	id: '2048',
	l: '1',
	name: 'Calendar 1',
	view: 'appointment' as FolderView,
	n: 1,
	uuid: 'abcd',
	recursive: false,
	deletable: false,
	activesyncdisabled: true,
	isLink: false,
	depth: 1,
	children: [],
	reminder: false,
	broken: false
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
		folders: {}
	}));
};

const setupInterceptor = (): Promise<any> =>
	new Promise<any>((resolve, reject) => {
		// Register a handler for the REST call
		getSetupServer().use(
			rest.post('/service/soap/FolderActionrequest', async (req, res, ctx) => {
				if (!req) {
					reject(new Error('Empty request'));
				}
				const cal = (await req.json()).Body.FolderActionRequest.action;
				resolve(cal);
				return res(
					ctx.json({
						Body: {
							FolderActionResponse: cal
						}
					})
				);
			})
		);
	});
describe('main-calendar-modal', () => {
	test('change color', async () => {
		const editSavingInterceptor = setupInterceptor();
		const closeFn = jest.fn();

		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();

		const { user } = setupTest(<EditModal folder={folder} onClose={closeFn} />, {
			store
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		await user.click(screen.getByText(/black/i));
		await user.click(screen.getByText(/red/i));
		await user.click(screen.getByText(/ok/i));

		const newCalendar = await editSavingInterceptor;
		await waitFor(() => {
			expect(newCalendar.color).toBe('2');
		});
	});
	test('change name', async () => {
		const editSavingInterceptor = setupInterceptor();
		setupFoldersStore();
		const closeFn = jest.fn();

		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(<EditModal folder={folder} onClose={closeFn} />, {
			store
		});

		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		const calendarName = screen.getByRole('textbox', {
			name: /calendar name/i
		});
		await user.type(calendarName, '23');
		await user.click(screen.getByText(/ok/i));

		const newCalendar = await editSavingInterceptor;
		await waitFor(() => {
			expect(newCalendar.name).toBe('Calendar 123');
		});
	});
	test('edit free-busy', async () => {
		const editSavingInterceptor = setupInterceptor();
		setupFoldersStore();
		const closeFn = jest.fn();

		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(<EditModal folder={folder} onClose={closeFn} />, {
			store
		});

		const freeBusyCheckbox = screen.getByTestId('icon: Square');
		expect(freeBusyCheckbox).toBeInTheDocument();
		await waitFor(() => {
			user.click(freeBusyCheckbox);
		});
		await user.click(screen.getByText(/ok/i));

		const newCalendar = await editSavingInterceptor;
		await waitFor(() => {
			expect(newCalendar.excludeFreeBusy).toBeUndefined();
		});
	});
	test('close modal', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(<></>, {
			store
		});
		const { result } = setupHook(useCalendarActions, { store, initialProps: [folder] });
		const editFn = find(result.current, ['id', 'edit']);
		await waitFor(() => {
			editFn.onClick();
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		const closeBtn = within(screen.getByTestId('MainEditModal')).getByTestId('icon: CloseOutline');
		await waitFor(() => {
			user.click(closeBtn);
		});
		await waitFor(() => {
			expect(screen.queryByTestId('MainEditModal')).not.toBeInTheDocument();
		});
	});
	test('add share', async () => {
		const closeFn = jest.fn();

		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(<EditModal folder={folder} onClose={closeFn} />, {
			store
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		const addShareBtn = screen.getByRole('button', {
			name: /add share/i
		});
		await waitFor(() => {
			user.click(addShareBtn);
		});
		await waitFor(() => {
			expect(screen.getByTestId('ShareCalendarModal')).toBeInTheDocument();
		});
	});
});
