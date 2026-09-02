/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { act } from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { keyBy } from 'lodash';

import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { DetailsPart } from '../details-part';
import { setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { generateRoots } from '@test-utils/folders/roots-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { getMocksContext } from '@test-utils/utils/mocks-context';

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
	test('the calendar icon tooltip shows only the calendar name for a non-linked calendar', async () => {
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

		const { user } = setupTest(
			<DetailsPart
				event={event}
				invite={invite}
				inviteNeverSent={invite.neverSent}
				isPrivate={event.resource.class === 'PRI'}
				subject={event.title}
			/>,
			{ store }
		);

		await user.hover(screen.getByTestId('icon: Calendar2'));
		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(await screen.findByText(folder.name)).toBeVisible();
	});
	test('the calendar icon tooltip shows the calendar name and owner for a linked calendar', async () => {
		const linkedFolder = {
			...generateFolder({
				view: 'appointment',
				id: '2345',
				name: 'Linked calendar',
				isLink: true
			}),
			owner: 'owner@zextras.com'
		};
		populateFoldersStore({ customFolders: [linkedFolder] });
		const event = mockedData.getEvent({ resource: { calendar: { id: linkedFolder.id } } });
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

		const { user } = setupTest(
			<DetailsPart
				event={event}
				invite={invite}
				inviteNeverSent={invite.neverSent}
				isPrivate={event.resource.class === 'PRI'}
				subject={event.title}
			/>,
			{ store }
		);

		expect(screen.queryByTestId('icon: Calendar2')).not.toBeInTheDocument();
		await user.hover(screen.getByTestId('icon: SharedCalendar'));
		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(await screen.findByText(`${linkedFolder.name} (${linkedFolder.owner})`)).toBeVisible();
	});
	test('the calendar icon is a delegated-calendar icon and the tooltip shows the shared account owner email', async () => {
		const sharedAccountIdentity = getMocksContext().identities.sendAs[0];
		const delegatedFolder = generateFolder({
			view: 'appointment',
			id: `${sharedAccountIdentity.identity.id}:2345`,
			name: 'Delegated calendar',
			isLink: false
		});
		populateFoldersStore({ customFolders: [delegatedFolder] });
		const event = mockedData.getEvent({ resource: { calendar: { id: delegatedFolder.id } } });
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

		const { user } = setupTest(
			<DetailsPart
				event={event}
				invite={invite}
				inviteNeverSent={invite.neverSent}
				isPrivate={event.resource.class === 'PRI'}
				subject={event.title}
			/>,
			{ store }
		);

		expect(screen.getByTestId('icon: DelegatedCalendar')).toBeVisible();

		await user.hover(screen.getByTestId('icon: DelegatedCalendar'));
		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(
			await screen.findByText(`${delegatedFolder.name} (${sharedAccountIdentity.identity.email})`)
		).toBeVisible();
	});
});
