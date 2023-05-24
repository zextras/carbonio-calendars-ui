/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { screen, waitFor, within, act } from '@testing-library/react';
import { rest } from 'msw';
import { find } from 'lodash';
import type { FolderView } from '../../carbonio-ui-commons/types/folder';
import { setupTest, setupHook } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import { EditModal } from './edit-modal/edit-modal';
import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { useCalendarActions } from '../../hooks/use-calendar-actions';

describe('main-calendar-modal', () => {
	test('change color', async () => {
		const closeFn = jest.fn();
		const grant = {
			zid: '0e9d1df6-30df-4e1d-aff6-212908045221',
			gt: 'usr',
			perm: 'r',
			d: 'gabriele.marino@zextras.com'
		} as const;
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
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<EditModal folder={folder} totalAppointments={folder.n} grant={grant} onClose={closeFn} />,
			{
				store
			}
		);
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		await user.click(screen.getByText(/black/i));
		await user.click(screen.getByText(/red/i));
		await user.click(screen.getByText(/ok/i));
		await waitFor(() => {
			expect(store.getState().calendars.calendars[folder.id].color.label).toBe('red');
		});
	});
	test('change name', async () => {
		const closeFn = jest.fn();
		const grant = {
			zid: '0e9d1df6-30df-4e1d-aff6-212908045221',
			gt: 'usr',
			perm: 'r',
			d: 'gabriele.marino@zextras.com'
		} as const;
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

		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<EditModal folder={folder} totalAppointments={folder.n} grant={grant} onClose={closeFn} />,
			{
				store
			}
		);

		const editSavingInterceptor = new Promise<any>((resolve, reject) => {
			// Register a handler for the REST call
			getSetupServer().use(
				rest.post('/service/soap/FolderActionrequest', async (req, res, ctx) => {
					if (!req) {
						reject(new Error('Empty request'));
					}
					const cal = (await req.json()).Body.FolderActionRequest.action;
					resolve(cal);
					return res(ctx.json({}));
				})
			);
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
		const closeFn = jest.fn();
		const grant = {
			zid: '0e9d1df6-30df-4e1d-aff6-212908045221',
			gt: 'usr',
			perm: 'r',
			d: 'gabriele.marino@zextras.com'
		} as const;
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

		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<EditModal folder={folder} totalAppointments={folder.n} grant={grant} onClose={closeFn} />,
			{
				store
			}
		);

		const editSavingInterceptor = new Promise<any>((resolve, reject) => {
			// Register a handler for the REST call
			getSetupServer().use(
				rest.post('/service/soap/FolderActionrequest', async (req, res, ctx) => {
					if (!req) {
						reject(new Error('Empty request'));
					}
					const cal = (await req.json()).Body.FolderActionRequest.action;
					resolve(cal);
					return res(ctx.json({}));
				})
			);
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
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(<></>, {
			store
		});
		const { result } = setupHook(() => useCalendarActions(folder), { store });
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
		const grant = {
			zid: '0e9d1df6-30df-4e1d-aff6-212908045221',
			gt: 'usr',
			perm: 'r',
			d: 'gabriele.marino@zextras.com'
		} as const;
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

		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<EditModal folder={folder} totalAppointments={folder.n} grant={grant} onClose={closeFn} />,
			{
				store
			}
		);
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
