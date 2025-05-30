/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { EditorSender } from './editor-sender';
import { reducers } from '../../../store/redux';
import { setupTest } from '@test-setup';
import { getMocksContext } from '@test-utils/utils/mocks-context';

describe('editor-sender', () => {
	test('should render correctly', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(<EditorSender editorId={'1'} />, { store });
		expect(screen.getByText('From')).toBeVisible();
	});
	test('should select the default value', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const mocksContext = getMocksContext();

		const { identity } = mocksContext.identities.primary;

		setupTest(<EditorSender editorId={'1'} />, { store });
		expect(screen.getByText(new RegExp(identity.fullName, 'i'))).toBeVisible();
	});
	test('onChange should select the new value', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const mocksContext = getMocksContext();

		const { primary, aliases } = mocksContext.identities;
		const secondary = aliases[0].identity;

		const { user } = setupTest(<EditorSender editorId={'1'} />, { store });

		const defaultSelection = new RegExp(primary.identity.fullName, 'i');
		const newSelection = new RegExp(secondary.fullName, 'i');

		await user.click(screen.getByText(defaultSelection));
		await user.click(screen.getByText(newSelection));

		expect(screen.queryByText(defaultSelection)).not.toBeInTheDocument();
		expect(screen.getByText(newSelection)).toBeVisible();
	});
});
