/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within, act } from '@testing-library/react';
import { Grant } from '@zextras/carbonio-shell-ui';
import { rest } from 'msw';

import { EditModal } from './edit-modal';
import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { generateRoots } from '../../../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import type { FolderView } from '../../../carbonio-ui-commons/types/folder';
import * as handler from '../../../store/actions/send-share-calendar-notification';
import { reducers } from '../../../store/redux';

const grants: Array<Grant> = [
	{
		zid: '302e2e8b-676d-4c93-aaa4-21e47bd3eeb9',
		gt: 'usr',
		perm: 'r',
		d: 'test1@email.it'
	},
	{
		zid: '0e9d1df6-30df-4e1d-aff6-212908045221',
		gt: 'usr',
		perm: 'r',
		d: 'test2@email.it'
	}
];
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
	broken: false,
	acl: {
		grant: grants
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

const setupInterceptor = (): Promise<any> =>
	new Promise<any>((resolve, reject) => {
		// Register a handler for the REST call
		getSetupServer().use(
			rest.post('/service/soap/FolderActionrequest', async (req, res, ctx) => {
				if (!req) {
					reject(new Error('Empty request'));
				}
				const cal = (await req.json()).Body.FolderActionRequest;
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

		getSetupServer().use(
			rest.post('/service/soap/BatchRequest', async (req, res, ctx) => {
				if (!req) {
					reject(new Error('Empty request'));
				}
				const cal = (await req.json()).Body.BatchRequest.FolderActionRequest;
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

jest.setTimeout(10000);

describe('edit modal', () => {
	test('If a role change, it should reflect on the list', async () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();
		const editRoleInterceptor = setupInterceptor();

		const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
			store
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		await user.click(screen.getAllByRole('button', { name: /edit/i })[0]);
		await waitFor(() => {
			expect(screen.getByTestId('EditPermissionModal')).toBeInTheDocument();
		});
		await user.click(
			within(screen.getByTestId('EditPermissionModal')).getAllByText(
				/share.options.share_calendar_role.viewer/i
			)[1]
		);
		await user.click(
			within(screen.getByTestId('EditPermissionModal')).getByText(
				/share.options.share_calendar_role.admin/i
			)
		);
		await user.click(screen.getByText(/edit share/i));
		const interceptorResponse = await editRoleInterceptor;
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(interceptorResponse[1].action.grant[0].perm).toBe('rwidxa');
		});
		await waitFor(() => {
			expect(interceptorResponse[1].action.grant[0].d).toBe('test1@email.it');
		});
	});
	test('If the folder is shared with someone, the shared list should be visible', async () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();

		setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
			store
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(
				screen.getByText(/test1@email\.it - share\.options\.share_calendar_role\.viewer/i)
			).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(
				screen.getByText(/test2@email\.it - share\.options\.share_calendar_role\.viewer/i)
			).toBeInTheDocument();
		});
	});
	test('Every person inside the list should have a role', async () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();

		setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
			store
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		folder.acl.grant.forEach((grant) => {
			expect(grant.perm).toBeDefined();
		});
	});

	test('If a user is revoked, the other should be in the list', async () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();
		const revokeInterceptor = setupInterceptor();

		const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
			store
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		await user.click(screen.getAllByRole('button', { name: /revoke/i })[0]);
		await waitFor(() => {
			expect(screen.getByTestId('RevokeModal')).toBeInTheDocument();
		});
		await user.click(within(screen.getByTestId('RevokeModal')).getByText('Revoke'));
		const interceptorResponse = await revokeInterceptor;
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(interceptorResponse.action.op).toBe('!grant');
		});
		await waitFor(() => {
			expect(interceptorResponse.action.id).toBe(folder.id);
		});
		await waitFor(() => {
			expect(
				screen.getByText(/test2@email\.it - share\.options\.share_calendar_role\.viewer/i)
			).toBeInTheDocument();
		});
	});

	test('on "Send again" click a new invitation must be send', async () => {
		const closeFn = jest.fn();
		const sendAgaingSpy = jest.spyOn(handler, 'sendShareCalendarNotification');
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();

		const { user } = setupTest(<EditModal folderId={folder.id} onClose={closeFn} />, {
			store
		});
		await waitFor(() => {
			expect(screen.getByTestId('MainEditModal')).toBeInTheDocument();
		});

		act(() => {
			user.click(screen.getAllByRole('button', { name: /resend/i })[0]);
		});
		await waitFor(() => {
			expect(sendAgaingSpy).toHaveBeenCalledTimes(1);
		});
	});
});
