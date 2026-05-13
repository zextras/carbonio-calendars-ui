/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { Folder, FOLDERS, Grant } from '@zextras/carbonio-ui-commons';
import { http, HttpResponse } from 'msw';

import { CalendarAccordionItem } from './calendar-accordion-item';
import * as utilities from '../../../commons/utilities';
import { TEST_SELECTORS } from 'constants/test-utils';
import { reducers } from 'store/redux';
import { getSetupServer } from '@jest-setup';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('CalendarAccordionItem', () => {
	const store = configureStore({ reducer: combineReducers(reducers) });

	const setupCalendarAccordionItem = (
		item: { id: string },
		customFolders?: Folder[]
	): ReturnType<typeof setupTest> => {
		populateFoldersStore({ customFolders });
		return setupTest(<CalendarAccordionItem item={item} />, { store });
	};

	describe('Rendering behavior', () => {
		it('renders nothing if calendar folder is not found', () => {
			const item = { id: 'non-existent-folder-id' };

			setupCalendarAccordionItem(item);

			expect(screen.queryByTestId('calendar-accordion-item')).not.toBeInTheDocument();
		});

		it('renders the accordion item with correct label for default calendar', () => {
			const item = { id: FOLDERS.CALENDAR };

			setupCalendarAccordionItem(item);

			expect(screen.getByText('Calendar')).toBeVisible();
		});
	});

	describe('Selection state', () => {
		it('renders with toggled icon when folder is selected (checked)', () => {
			const customFolder = generateFolder({
				view: 'appointment',
				id: '2345',
				name: 'CustomCalendar',
				checked: true
			});
			const item = { id: customFolder.id };

			setupCalendarAccordionItem(item, [customFolder]);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.selectedCalendar)).toBeVisible();
		});

		it('renders with un-toggled icon when folder is not selected (unchecked)', () => {
			const customFolder = generateFolder({
				view: 'appointment',
				id: '2345',
				name: 'CustomCalendar',
				checked: false
			});
			const item = { id: customFolder.id };

			setupCalendarAccordionItem(item, [customFolder]);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar)).toBeVisible();
		});

		it('renders group selected icon for checked datasource root folders', () => {
			const customFolder = generateFolder({
				view: 'appointment',
				id: '3345',
				name: 'DatasourceRootChecked',
				checked: true
			});
			customFolder.dsId = '700';
			customFolder.dsType = 'caldav';
			const item = { id: customFolder.id };

			setupCalendarAccordionItem(item, [customFolder]);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.selectedCalendarGroup)).toBeVisible();
		});

		it('renders existing unselected calendar icon for unchecked non-CalDAV datasource roots', () => {
			const customFolder = generateFolder({
				view: 'appointment',
				id: '4345',
				name: 'DatasourceRootUnchecked',
				checked: false
			});
			customFolder.dsId = '701';
			customFolder.dsType = 'cal';
			const item = { id: customFolder.id };

			setupCalendarAccordionItem(item, [customFolder]);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar)).toBeVisible();
		});

		it('renders existing calendar icon for datasource child folders', () => {
			const childFolder = generateFolder({
				view: 'appointment',
				id: '5346',
				name: 'DatasourceChild',
				checked: true,
				absFolderPath: '/DatasourceRootChecked/DatasourceChild',
				l: '5345'
			});
			const datasourceRoot = generateFolder({
				view: 'appointment',
				id: '5345',
				name: 'DatasourceRootChecked',
				checked: true,
				children: [childFolder]
			});
			datasourceRoot.dsId = '702';
			datasourceRoot.dsType = 'caldav';
			const item = { id: childFolder.id };

			setupCalendarAccordionItem(item, [datasourceRoot]);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.selectedCalendar)).toBeVisible();
		});
	});

	describe('Interaction', () => {
		it('calls recursiveToggleCheck when row is clicked', async () => {
			getSetupServer().use(
				http.post('/service/soap/BatchRequest', () => HttpResponse.json({ Body: {} }))
			);

			const item = { id: FOLDERS.CALENDAR };
			const recursiveToggleCheckMock = vi.spyOn(utilities, 'recursiveToggleCheck');

			const { user } = setupCalendarAccordionItem(item);

			const accordionLabel = screen.getByText('Calendar');
			await user.click(accordionLabel);

			expect(recursiveToggleCheckMock).toHaveBeenCalled();
		});
	});

	describe('Calendar status indicators', () => {
		it('shows external status icon when calendar is external', () => {
			const customFolder = {
				...generateFolder({
					view: 'appointment',
					id: '9345',
					name: 'ExternalCalendar',
					checked: false
				}),
				f: 'y',
				url: 'https://example.com/calendar.ics',
				acl: undefined
			};
			const item = { id: customFolder.id };

			setupCalendarAccordionItem(item, [customFolder]);

			expect(screen.getByTestId('external-calendar-indicator')).toBeVisible();
		});

		it('shows shared status icon when calendar is shared', () => {
			const grant: Grant = {
				zid: '8296bac8-8749-42c0-be86-f3dfa02c6719',
				gt: 'usr',
				perm: 'r',
				d: 'foo@test.com'
			};
			const customFolder = generateFolder({
				view: 'appointment',
				id: '2345',
				name: 'CustomCalendar',
				acl: { grant: [grant] },
				checked: false
			});
			const item = { id: customFolder.id };

			setupCalendarAccordionItem(item, [customFolder]);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.shared)).toBeVisible();
		});

		it('shows linked status icon when calendar is a link', () => {
			const customFolder = generateFolder({
				view: 'appointment',
				id: '2345',
				name: 'CustomCalendar',
				isLink: true,
				checked: false
			});
			const item = { id: customFolder.id };

			setupCalendarAccordionItem(item, [customFolder]);

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.linked)).toBeVisible();
		});
	});

	describe('ICS File import functionality', () => {
		it('renders hidden file input for ICS import', () => {
			const item = { id: FOLDERS.CALENDAR };

			setupCalendarAccordionItem(item);

			const fileInput = screen.getByTestId('icsFileInput');
			expect(fileInput).toBeInTheDocument();
			expect(fileInput).toHaveAttribute('type', 'file');
			expect(fileInput).toHaveAttribute('accept', '.ics');
			expect(fileInput).toHaveStyle({ display: 'none' });
		});

		it('opens import confirmation modal when file is selected', async () => {
			const item = { id: FOLDERS.CALENDAR };
			const { user } = setupCalendarAccordionItem(item);

			const fileInput = screen.getByTestId('icsFileInput');
			const file = new File(['calendar content'], 'test-calendar.ics', { type: 'text/calendar' });

			await user.upload(fileInput, file);

			await waitFor(() => {
				expect(screen.getByText('Import appointments')).toBeVisible();
			});
			expect(
				screen.getByText(/The appointments contained within test-calendar.ics will be imported/)
			).toBeVisible();
			expect(screen.getByRole('button', { name: 'Import' })).toBeVisible();
		});

		it('closes modal when cancel is clicked', async () => {
			const item = { id: FOLDERS.CALENDAR };
			const { user } = setupCalendarAccordionItem(item);

			const fileInput = screen.getByTestId('icsFileInput');
			const file = new File(['calendar content'], 'test-calendar.ics', { type: 'text/calendar' });

			await user.upload(fileInput, file);

			// eslint-disable-next-line testing-library/no-node-access
			const closeButton = screen.getByTestId('icon: Close').closest('button');
			expect(closeButton).not.toBeNull();
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await user.click(closeButton);

			expect(screen.queryByText('Import appointments')).not.toBeInTheDocument();
		});
	});
});
