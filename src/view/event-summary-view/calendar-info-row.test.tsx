/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { CalendarInfoRow } from './calendar-info-row';
import mockedData from '../../test/generators';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { getMocksContext } from '@test-utils/utils/mocks-context';

describe('CalendarInfoRow', () => {
	it('renders nothing if the calendar folder is not found', () => {
		populateFoldersStore();
		const event = mockedData.getEvent({
			resource: { calendar: { id: 'non-existent-folder-id' } }
		});

		setupTest(<CalendarInfoRow event={event} />);

		expect(screen.queryByTestId('icon: Calendar2')).not.toBeInTheDocument();
	});

	it('renders only the calendar name and the own-calendar icon for a non-linked calendar', () => {
		const customFolder = generateFolder({
			view: 'appointment',
			id: '2345',
			name: 'CustomCalendar',
			isLink: false
		});
		populateFoldersStore({ customFolders: [customFolder] });
		const event = mockedData.getEvent({ resource: { calendar: { id: customFolder.id } } });

		setupTest(<CalendarInfoRow event={event} />);

		expect(screen.getByText('CustomCalendar')).toBeVisible();
		expect(screen.getByTestId('icon: Calendar2')).toBeVisible();
	});

	it('appends the owner in parentheses and shows the shared-calendar icon for a linked calendar', () => {
		const customFolder = {
			...generateFolder({
				view: 'appointment',
				id: '2345',
				name: 'Calendar',
				isLink: true
			}),
			owner: 'mattia.tisato@zextras.com'
		};
		populateFoldersStore({ customFolders: [customFolder] });
		const event = mockedData.getEvent({ resource: { calendar: { id: customFolder.id } } });

		setupTest(<CalendarInfoRow event={event} />);

		expect(screen.getByText('Calendar')).toBeVisible();
		expect(screen.getByText('(mattia.tisato@zextras.com)')).toBeVisible();
		expect(screen.getByTestId('icon: SharedCalendar')).toBeVisible();
	});

	it('shows the delegated-calendar icon and the shared account owner email for a calendar belonging to a shared account', () => {
		const sharedAccountIdentity = getMocksContext().identities.sendAs[0];
		const customFolder = generateFolder({
			view: 'appointment',
			id: `${sharedAccountIdentity.identity.id}:2345`,
			name: 'Delegated calendar',
			isLink: false
		});
		populateFoldersStore({ customFolders: [customFolder] });
		const event = mockedData.getEvent({ resource: { calendar: { id: customFolder.id } } });

		setupTest(<CalendarInfoRow event={event} />);

		expect(screen.getByTestId('icon: DelegatedCalendar')).toBeVisible();
		expect(screen.getByText('Delegated calendar')).toBeVisible();
		expect(screen.getByText(`(${sharedAccountIdentity.identity.email})`)).toBeVisible();
	});
});
