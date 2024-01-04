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
import { MemoCustomEvent } from './custom-event';

jest.setTimeout(10000);

test('click edit appointment from event summary view as organizer', async () => {
	const event = mockedData.getEvent();
	const invite = mockedData.getInvite({ event });
	const mockedInviteSlice = {
		invites: {
			[invite.id]: invite
		}
	};
	const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
	const store = configureStore({ reducer: combineReducers(reducers), preloadedState: emptyStore });
	const { user } = setupTest(<MemoCustomEvent event={event} title={event.title} />, {
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
