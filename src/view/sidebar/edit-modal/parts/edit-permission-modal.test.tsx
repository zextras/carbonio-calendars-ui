/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { fireEvent, screen } from '@testing-library/react';
import { FolderView } from '@zextras/carbonio-shell-ui/lib/types/misc';

import { EditPermissionModal } from './edit-permission-modal';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { EditModalContext } from '../../../../commons/edit-modal-context';
import { reducers } from '../../../../store/redux';
import userEvent from '@testing-library/user-event';

const test1UserGrant = {
	zid: '302e2e8b-676d-4c93-aaa4-21e47bd3eeb9',
	gt: 'usr',
	perm: 'r',
	d: 'test1@email.it'
} as const;

const folder = {
	absFolderPath: '/calendar 1',
	id: '2048',
	l: '1',
	name: 'Calendar 1',
	view: 'appointment' as FolderView,
	n: 12,
	color: 0,
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
		grant: [test1UserGrant]
	}
};

const roleOptions = [
	{ label: 'None', value: '' },
	{ label: 'Viewer (can view)', value: 'r' },
	{
		label:
			'Editor (can view, edit, add, and delete but cannot accept or reshare appointments)                ',
		value: 'rwidxa'
	},
	{
		label: 'Manager (can view, edit, add, delete, accept and reshare appointments)',
		value: 'rwidx'
	}
];

const contextOptions = {
	setModal: (): void => {},
	onClose: (): void => {},
	roleOptions,
	setActiveGrant: (): void => {}
};

describe('permission modal', () => {
	test(`can be closed using 'Edit share' button`, () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<EditModalContext.Provider value={contextOptions}>
				<EditPermissionModal folder={folder} onGoBack={closeFn} grant={test1UserGrant} />
			</EditModalContext.Provider>,
			{
				store
			}
		);

		const confirmButton = screen.getByText('Edit share');
		expect(confirmButton).toBeVisible();

		// eslint-disable-next-line testing-library/prefer-user-event
		fireEvent.click(confirmButton);

		expect(closeFn).toBeCalledTimes(1);
	});

	test(`can be closed using 'Go back' button`, () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<EditModalContext.Provider value={contextOptions}>
				<EditPermissionModal folder={folder} onGoBack={closeFn} grant={test1UserGrant} />
			</EditModalContext.Provider>,
			{
				store
			}
		);

		const confirmButton = screen.getByText('Go back');
		expect(confirmButton).toBeVisible();

		// eslint-disable-next-line testing-library/prefer-user-event
		fireEvent.click(confirmButton);

		expect(closeFn).toBeCalledTimes(1);
	});

	test('contains the right role for the grantee', () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<EditModalContext.Provider value={contextOptions}>
				<EditPermissionModal folder={folder} onGoBack={closeFn} grant={test1UserGrant} />
			</EditModalContext.Provider>,
			{
				store
			}
		);

		expect(screen.getByText(roleOptions[1].label)).toBeVisible();
	});

	test('contains the right description for the grantee', () => {
		const closeFn = jest.fn();
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<EditModalContext.Provider value={contextOptions}>
				<EditPermissionModal folder={folder} onGoBack={closeFn} grant={test1UserGrant} />
			</EditModalContext.Provider>,
			{
				store
			}
		);

		expect(screen.getByText('test1@email.it - Viewer (can view)')).toBeVisible();
	});
});
