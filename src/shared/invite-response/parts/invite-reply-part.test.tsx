/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { keyBy } from 'lodash';

import { buildMailMessageType, MESSAGE_TYPE } from '../invite-test-utils';
import InviteReplyPart from './invite-reply-part';
import { setupTest } from '@test-setup';
import { generateRoots } from '@test-utils/folders/roots-generator';
import { MESSAGE_METHOD } from 'constants/api';
import { reducers } from 'store/redux';
import mockedData from 'test/generators';

const SECONDARY_CALENDAR_NAME = 'Secondary Calendar';
const SHARED_CALENDAR_NAME = 'Shared Calendar';
const CALENDAR_SELECTOR_TEST_ID = 'calendar-selector';

const store = configureStore({ reducer: combineReducers(reducers) });
const roots = generateRoots();
const { defaultCalendar } = mockedData.calendars;
const secondaryCalendar = mockedData.calendars.getCalendar({
	id: '11',
	name: SECONDARY_CALENDAR_NAME,
	color: 3,
	perm: 'rwidx'
});
const sharedCalendar = mockedData.calendars.getCalendar({
	id: '12',
	name: SHARED_CALENDAR_NAME,
	owner: 'owner@example.com',
	perm: 'rwidx',
	isLink: true
});

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		folders: {
			...keyBy(roots, 'id'),
			[defaultCalendar.id]: defaultCalendar,
			[secondaryCalendar.id]: secondaryCalendar,
			[sharedCalendar.id]: sharedCalendar
		}
	}));
};

describe('InviteReplyPart - Calendar Selection', () => {
	beforeEach(() => {
		setupFoldersStore();
	});

	describe('Calendar selector rendering', () => {
		test('renders calendar selector component', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, { store });

			const calendarSelector = await screen.findByTestId(CALENDAR_SELECTOR_TEST_ID);
			expect(calendarSelector).toBeVisible();
		});

		test('displays "Scheduled in" label for calendar selector', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, { store });

			const scheduledInLabel = await screen.findByText('Scheduled in');
			expect(scheduledInLabel).toBeVisible();
		});

		test('displays the parent calendar as initially selected', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
				parent: defaultCalendar.id
			});

			setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, { store });

			const calendarSelector = await screen.findByTestId(CALENDAR_SELECTOR_TEST_ID);
			expect(calendarSelector).toBeVisible();

			await waitFor(() => {
				expect(screen.getByText('Calendar')).toBeVisible();
			});
		});
	});

	describe('Calendar selection interaction', () => {
		test('initializes with parent calendar selected and maintains state when accepting without calendar change', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
				parent: defaultCalendar.id
			});
			setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, { store });

			await waitFor(() => {
				expect(screen.getByText('Calendar')).toBeVisible();
			});

			const acceptButton = await screen.findByRole('button', { name: /Accept/i });
			expect(acceptButton).toBeEnabled();
		});

		test('allows user to select a different calendar', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
				parent: defaultCalendar.id
			});

			const { user } = setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, {
				store
			});

			const calendarSelector = await screen.findByTestId(CALENDAR_SELECTOR_TEST_ID);
			expect(calendarSelector).toBeVisible();

			await user.click(screen.getByText(/^Calendar$/i));
			await user.click(screen.getAllByText(/secondary calendar/i)[0]);

			await waitFor(() => {
				expect(screen.getByText(SECONDARY_CALENDAR_NAME)).toBeVisible();
			});
		});

		test('shows shared calendars with write permission in calendar list', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
				parent: defaultCalendar.id
			});

			const { user } = setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, {
				store
			});

			await user.click(screen.getByText(/^Calendar$/i));

			const sharedCalOptions = await screen.findAllByText(/Shared Calendar/i);
			expect(sharedCalOptions[0]).toBeVisible();
		});

		test('persists calendar selection across multiple changes', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
				parent: defaultCalendar.id
			});

			const { user } = setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, {
				store
			});

			await user.click(screen.getByText(/^Calendar$/i));
			await user.click((await screen.findAllByText(new RegExp(SECONDARY_CALENDAR_NAME, 'i')))[0]);
			await waitFor(() => {
				expect(screen.getByText(SECONDARY_CALENDAR_NAME)).toBeVisible();
			});

			await user.click(screen.getAllByText(/Secondary Calendar/i)[0]);
			await user.click((await screen.findAllByText(/Shared Calendar/i))[0]);
			await waitFor(() => {
				expect(screen.getByText(SHARED_CALENDAR_NAME)).toBeVisible();
			});

			await user.click(screen.getAllByText(/Shared Calendar/i)[0]);
			await user.click(await screen.findByText(/^Calendar$/i));
			await waitFor(() => {
				expect(screen.getByText('Calendar')).toBeVisible();
			});
		});
	});

	describe('Component features', () => {
		test('renders notify organizer checkbox that is checked by default', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);

			setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, { store });

			expect(await screen.findByText(/Notify Organizer/i)).toBeVisible();
			expect(await screen.findByTestId('icon: CheckmarkSquare')).toBeVisible();
		});

		test('renders action buttons for accept, tentative, decline, and propose new time', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);

			setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, { store });

			expect(await screen.findByRole('button', { name: /Accept/i })).toBeVisible();
			expect(screen.getByRole('button', { name: /Tentative/i })).toBeVisible();
			expect(screen.getByRole('button', { name: /Decline/i })).toBeVisible();
			expect(screen.getByRole('button', { name: /Propose new time/i })).toBeVisible();
		});

		test('calendar selection state is independent of notify organizer checkbox state', async () => {
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
				parent: defaultCalendar.id
			});

			const { user } = setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, {
				store
			});

			await user.click(screen.getByText(/^Calendar$/i));
			await user.click((await screen.findAllByText(/Secondary Calendar/i))[0]);
			await waitFor(() => {
				expect(screen.getByText(SECONDARY_CALENDAR_NAME)).toBeVisible();
			});

			const notifyCheckbox = screen.getByTestId('checkbox');
			await user.click(notifyCheckbox);

			expect(screen.getByText(SECONDARY_CALENDAR_NAME)).toBeVisible();
			await waitFor(() => {
				expect(screen.getByTestId('icon: Square')).toBeVisible();
			});

			await user.click(notifyCheckbox);

			expect(screen.getByText(SECONDARY_CALENDAR_NAME)).toBeVisible();
			await waitFor(() => {
				expect(screen.getByTestId('icon: CheckmarkSquare')).toBeVisible();
			});
		});
	});

	describe('Calendar selector configuration', () => {
		test('excludes trash calendars from calendar selector options', async () => {
			const trashCalendar = mockedData.calendars.getCalendar({
				id: '3',
				name: 'Trash',
				absFolderPath: '/Trash'
			});

			useFolderStore.setState((state) => ({
				folders: {
					...state.folders,
					[trashCalendar.id]: trashCalendar
				}
			}));

			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);

			const { user } = setupTest(<InviteReplyPart inviteId={mailMsg.id} message={mailMsg} />, {
				store
			});

			await user.click(screen.getByText(/^Calendar$/i));

			expect(screen.queryByText(/^Trash$/i)).not.toBeInTheDocument();
		});
	});
});
