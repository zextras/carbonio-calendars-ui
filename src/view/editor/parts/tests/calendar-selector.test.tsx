/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { within } from '@testing-library/react';
import { Folder, FOLDERS, useFolderStore } from '@zextras/carbonio-ui-commons';
import { keyBy } from 'lodash';

import { CalendarSelector } from '../calendar-selector';
import { screen, setupTest } from '@test-setup';
import { generateRoots } from '@test-utils/folders/roots-generator';
import { getMocksContext } from '@test-utils/utils/mocks-context';
import { TEST_SELECTORS } from 'constants/test-utils';
import mockedData from 'test/generators';

const OWN_CALENDAR_NAME = 'Calendar';
const OWN_SECONDARY_CALENDAR_NAME = 'Personal';
const DELEGATED_CALENDAR_NAME = 'Delegated calendar';
const DELEGATED_READONLY_CALENDAR_NAME = 'Delegated readonly calendar';
const OTHER_DELEGATED_CALENDAR_NAME = 'Other delegated calendar';

const { defaultCalendar } = mockedData.calendars;

/**
 * Builds a folders store holding the primary account calendars plus the calendars of the
 * two shared accounts the mocks context grants delegate access on.
 */
const setupFoldersStore = (): {
	delegatedCalendar: Folder;
	otherDelegatedCalendar: Folder;
} => {
	const roots = keyBy(generateRoots(), 'id');
	const { identities } = getMocksContext();
	const delegatedAccountRootId = `${identities.sendAs[0].userRootId}:1`;
	const otherDelegatedAccountRootId = `${identities.sendOnBehalf[0].userRootId}:1`;

	const ownCalendar = { ...defaultCalendar, parent: FOLDERS.USER_ROOT };
	const ownSecondaryCalendar = mockedData.calendars.getCalendar({
		id: '11',
		name: OWN_SECONDARY_CALENDAR_NAME,
		parent: FOLDERS.USER_ROOT
	});
	const delegatedCalendar = mockedData.calendars.getCalendar({
		id: `${identities.sendAs[0].userRootId}:200`,
		name: DELEGATED_CALENDAR_NAME,
		perm: 'rwidx',
		l: delegatedAccountRootId,
		parent: delegatedAccountRootId
	});
	const delegatedReadonlyCalendar = mockedData.calendars.getCalendar({
		id: `${identities.sendAs[0].userRootId}:201`,
		name: DELEGATED_READONLY_CALENDAR_NAME,
		perm: 'r',
		l: delegatedAccountRootId,
		parent: delegatedAccountRootId
	});
	const otherDelegatedCalendar = mockedData.calendars.getCalendar({
		id: `${identities.sendOnBehalf[0].userRootId}:300`,
		name: OTHER_DELEGATED_CALENDAR_NAME,
		perm: 'rwidx',
		l: otherDelegatedAccountRootId,
		parent: otherDelegatedAccountRootId
	});

	useFolderStore.setState(() => ({
		folders: {
			...roots,
			[FOLDERS.USER_ROOT]: {
				...roots[FOLDERS.USER_ROOT],
				children: [ownCalendar, ownSecondaryCalendar]
			},
			[delegatedAccountRootId]: {
				...roots[delegatedAccountRootId],
				children: [delegatedCalendar, delegatedReadonlyCalendar]
			},
			[otherDelegatedAccountRootId]: {
				...roots[otherDelegatedAccountRootId],
				children: [otherDelegatedCalendar]
			},
			[ownCalendar.id]: ownCalendar,
			[ownSecondaryCalendar.id]: ownSecondaryCalendar,
			[delegatedCalendar.id]: delegatedCalendar,
			[delegatedReadonlyCalendar.id]: delegatedReadonlyCalendar,
			[otherDelegatedCalendar.id]: otherDelegatedCalendar
		}
	}));

	return { delegatedCalendar, otherDelegatedCalendar };
};

describe('CalendarSelector', () => {
	describe('when the selected calendar belongs to a shared account', () => {
		it('offers only that account calendars by default', async () => {
			const { delegatedCalendar } = setupFoldersStore();

			const { user } = setupTest(
				<CalendarSelector
					calendarId={delegatedCalendar.id}
					onCalendarChange={vi.fn()}
					excludeTrash
				/>
			);
			await user.click(screen.getByText(DELEGATED_CALENDAR_NAME));

			const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
			expect(within(dropdown).getByText(DELEGATED_CALENDAR_NAME)).toBeVisible();
			expect(within(dropdown).queryByText(OWN_CALENDAR_NAME)).not.toBeInTheDocument();
			expect(within(dropdown).queryByText(OWN_SECONDARY_CALENDAR_NAME)).not.toBeInTheDocument();
			expect(within(dropdown).queryByText(OTHER_DELEGATED_CALENDAR_NAME)).not.toBeInTheDocument();
		});

		it('offers every owned and delegated calendar when allowAllAccounts is set', async () => {
			const { delegatedCalendar } = setupFoldersStore();

			const { user } = setupTest(
				<CalendarSelector
					calendarId={delegatedCalendar.id}
					onCalendarChange={vi.fn()}
					excludeTrash
					allowAllAccounts
				/>
			);
			await user.click(screen.getByText(DELEGATED_CALENDAR_NAME));

			const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
			expect(within(dropdown).getByText(OWN_CALENDAR_NAME)).toBeVisible();
			expect(within(dropdown).getByText(OWN_SECONDARY_CALENDAR_NAME)).toBeVisible();
			expect(within(dropdown).getByText(DELEGATED_CALENDAR_NAME)).toBeVisible();
			expect(within(dropdown).getByText(OTHER_DELEGATED_CALENDAR_NAME)).toBeVisible();
		});

		it('still hides the delegated calendars the user cannot write on', async () => {
			const { delegatedCalendar } = setupFoldersStore();

			const { user } = setupTest(
				<CalendarSelector
					calendarId={delegatedCalendar.id}
					onCalendarChange={vi.fn()}
					excludeTrash
					allowAllAccounts
				/>
			);
			await user.click(screen.getByText(DELEGATED_CALENDAR_NAME));

			const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
			expect(
				within(dropdown).queryByText(DELEGATED_READONLY_CALENDAR_NAME)
			).not.toBeInTheDocument();
		});

		it('lists the owned calendars before the delegated ones', async () => {
			const { delegatedCalendar } = setupFoldersStore();

			const { user } = setupTest(
				<CalendarSelector
					calendarId={delegatedCalendar.id}
					onCalendarChange={vi.fn()}
					excludeTrash
					allowAllAccounts
				/>
			);
			await user.click(screen.getByText(DELEGATED_CALENDAR_NAME));

			const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
			const positionOf = (name: string): number => (dropdown.textContent ?? '').indexOf(name);

			// the primary account default calendar opens the list, its other calendars follow,
			// and every delegated calendar is pushed after them
			expect(positionOf(OWN_CALENDAR_NAME)).toBe(0);
			expect(positionOf(OWN_SECONDARY_CALENDAR_NAME)).toBeLessThan(
				positionOf(DELEGATED_CALENDAR_NAME)
			);
			expect(positionOf(OWN_SECONDARY_CALENDAR_NAME)).toBeLessThan(
				positionOf(OTHER_DELEGATED_CALENDAR_NAME)
			);
		});

		it('notifies the selection of an owned calendar', async () => {
			const { delegatedCalendar } = setupFoldersStore();
			const onCalendarChange = vi.fn();

			const { user } = setupTest(
				<CalendarSelector
					calendarId={delegatedCalendar.id}
					onCalendarChange={onCalendarChange}
					excludeTrash
					allowAllAccounts
				/>
			);
			await user.click(screen.getByText(DELEGATED_CALENDAR_NAME));
			const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
			await user.click(within(dropdown).getByText(OWN_SECONDARY_CALENDAR_NAME));

			expect(onCalendarChange).toHaveBeenCalledWith(
				expect.objectContaining({ id: '11', name: OWN_SECONDARY_CALENDAR_NAME })
			);
		});
	});

	describe('when the selected calendar belongs to the primary account', () => {
		it('offers every owned and delegated calendar regardless of allowAllAccounts', async () => {
			setupFoldersStore();

			const { user } = setupTest(
				<CalendarSelector calendarId={defaultCalendar.id} onCalendarChange={vi.fn()} excludeTrash />
			);
			// the field label and the selected calendar are both named "Calendar" here,
			// so the dropdown is opened from the chevron instead of the calendar name
			await user.click(screen.getByTestId('icon: ChevronDownOutline'));

			const dropdown = await screen.findByTestId(TEST_SELECTORS.DROPDOWN);
			expect(within(dropdown).getByText(OWN_SECONDARY_CALENDAR_NAME)).toBeVisible();
			expect(within(dropdown).getByText(DELEGATED_CALENDAR_NAME)).toBeVisible();
			expect(within(dropdown).getByText(OTHER_DELEGATED_CALENDAR_NAME)).toBeVisible();
		});
	});
});
