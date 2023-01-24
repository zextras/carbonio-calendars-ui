/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import React from 'react';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import { CustomEvent } from './custom-event';

test('click edit appointment from event summary view as organizer', async () => {
	const event = mockedData.getEvent();
	const store = configureStore({ reducer: combineReducers(reducers) });
	const { user } = setupTest(<CustomEvent event={event} title={event.title} />, {
		store
		// keep it for reference
		// initialEntries: ['/fake-calendarId/expand/fake-apptId/fake-ridZ'],
		// path: '/:calendarId?/:action?/:apptId?/:ridZ?'
	});
	expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
	await user.click(screen.getByTestId('calendar-event-inner-container'));
	// this means the summary view is open
	expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
});
