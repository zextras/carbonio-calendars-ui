/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { keyBy } from 'lodash';

import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { DetailsPart } from '../details-part';
import { setupTest } from '@test-setup';
import { generateRoots } from '@test-utils/folders/roots-generator';

const roots = generateRoots();
const folder = mockedData.calendars.defaultCalendar;

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		folders: {
			...keyBy(roots, 'id'),
			[folder.id]: folder
		}
	}));
};

describe('title-row', () => {
	test('if the event is not part of a recurrence it wont have a recurrent icon', async () => {
		setupFoldersStore();
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});

		setupTest(
			<DetailsPart
				event={event}
				invite={invite}
				inviteNeverSent={invite.neverSent}
				isPrivate={event.resource.class === 'PRI'}
				subject={event.title}
			/>,
			{ store }
		);

		expect(screen.queryByTestId('icon: Repeat')).not.toBeInTheDocument();
	});
	test('if the event is part of a recurrence it will have a recurrent icon', async () => {
		setupFoldersStore();
		const event = mockedData.getEvent({ resource: { isRecurrent: true } });
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});

		setupTest(
			<DetailsPart
				event={event}
				invite={invite}
				inviteNeverSent={invite.neverSent}
				isPrivate={event.resource.class === 'PRI'}
				subject={event.title}
			/>,
			{ store }
		);
		expect(screen.getByTestId('icon: Repeat')).toBeVisible();
	});
});
