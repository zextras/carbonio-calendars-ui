/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { DeletePermanently } from '../delete-permanently';

describe('delete-permanently', () => {
	it('renders a title', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(<DeletePermanently onClose={jest.fn} event={mockedData.getEvent()} />, { store });

		expect(
			screen.getByText('Are you sure you want to delete this appointment permanently?')
		).toBeVisible();
	});
	it('renders a recurrent description', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<DeletePermanently
				onClose={jest.fn}
				event={mockedData.getEvent({ resource: { isRecurrent: true } })}
			/>,
			{ store }
		);

		expect(
			screen.getByText(
				'This will delete all occurrences of this appointment and you will not be able to recover it again, continue?'
			)
		).toBeVisible();
	});
	it('renders a single event description', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(<DeletePermanently onClose={jest.fn} event={mockedData.getEvent()} />, { store });

		expect(
			screen.getByText(
				'By deleting permanently this appointment you will not be able to recover it anymore, continue?'
			)
		).toBeVisible();
	});
});
