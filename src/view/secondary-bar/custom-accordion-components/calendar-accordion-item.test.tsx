/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { http, HttpResponse } from 'msw';

import { CalendarAccordionItem } from './calendar-accordion-item';
import * as utilities from '../../../commons/utilities';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import { reducers } from '../../../store/redux';
import { getSetupServer } from '@jest-setup';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('CalendarAccordionItem', () => {
	const store = configureStore({ reducer: combineReducers(reducers) });

	it('renders nothing if calendar folder is not found', () => {
		const item = {
			id: 'non-existent-folder-id'
		};

		setupTest(<CalendarAccordionItem item={item} />, { store });

		expect(screen.queryByTestId('calendar-accordion-item')).not.toBeInTheDocument();
	});

	it('renders the accordion item with correct label', () => {
		populateFoldersStore();
		const item = { id: FOLDERS.CALENDAR };

		setupTest(<CalendarAccordionItem item={item} />, { store });

		expect(screen.getByText('Calendar')).toBeVisible();
	});

	it('renders the accordion item with toggled icon, when folder is selected (checked)', () => {
		const customFolder = generateFolder({
			view: 'appointment',
			id: '2345',
			name: 'CustomCalendar'
		});

		populateFoldersStore({ customFolders: [{ ...customFolder, checked: true }] });

		const item = { id: customFolder.id };

		setupTest(<CalendarAccordionItem item={item} />, { store });

		expect(screen.getByTestId(TEST_SELECTORS.ICONS.selectedCalendar)).toBeVisible();
	});

	it('renders the accordion item with un-toggled icon, when folder is not selected(checked)', () => {
		const customFolder = generateFolder({
			view: 'appointment',
			id: '2345',
			name: 'CustomCalendar'
		});

		populateFoldersStore({ customFolders: [{ ...customFolder, checked: false }] });

		const item = { id: customFolder.id };

		setupTest(<CalendarAccordionItem item={item} />, { store });

		expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar)).toBeVisible();
	});

	it('calls recursiveToggleCheck when row is clicked', async () => {
		getSetupServer().use(
			http.post('/service/soap/BatchRequest', () => HttpResponse.json({ Body: {} }))
		);

		populateFoldersStore();
		const item = { id: FOLDERS.CALENDAR };
		const recursiveToggleCheckMock = jest.spyOn(utilities, 'recursiveToggleCheck');

		const { user } = setupTest(<CalendarAccordionItem item={item} />, { store });

		const accordionLabel = screen.getByText('Calendar');
		await user.click(accordionLabel);

		expect(recursiveToggleCheckMock).toHaveBeenCalled();
	});
});
