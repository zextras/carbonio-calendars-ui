/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useTheme } from '@zextras/carbonio-design-system';

import { GroupAccordionItem } from './group-accordion-item';
import { setupTest, screen, setupHook } from '../../../__test__/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import { reducers } from '../../../store/redux';
import { generateGroup, populateGroupsStore } from '../../../test/generators/group';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';
import { generateSoapErrorResponseBody } from 'test/generators/utils';

describe('GroupAccordionItem', () => {
	it('renders nothing if group is not found', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const item = { id: 'non-existent-group-id' };

		const { container } = setupTest(<GroupAccordionItem item={item} />, { store });
		expect(container).toBeEmptyDOMElement();
	});

	it('should display the correct label', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const groups = [generateGroup()];
		populateGroupsStore({
			groups
		});
		const item = { id: groups[0].id };

		setupTest(<GroupAccordionItem item={item} />, { store });

		expect(screen.getByText(groups[0].name)).toBeVisible();
	});

	describe('Empty group state', () => {
		it('should display a disabled icon if the group has no calendars', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const groups = [generateGroup({ calendarId: [] })];
			populateGroupsStore({
				groups
			});
			const item = { id: groups[0].id };
			const {
				result: { current: theme }
			} = setupHook(useTheme);

			setupTest(<GroupAccordionItem item={item} />, { store });

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendarGroup)).toBeVisible();
			expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendarGroup)).toHaveStyle(
				`color: ${theme.palette.text.disabled}`
			);
		});

		it('should display a warning icon if the group has no calendars', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const groups = [generateGroup({ calendarId: [] })];
			populateGroupsStore({
				groups
			});
			const item = { id: groups[0].id };

			const {
				result: { current: theme }
			} = setupHook(useTheme);

			setupTest(<GroupAccordionItem item={item} />, { store });

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.emptyGroupWarning)).toBeVisible();
			expect(screen.getByTestId(TEST_SELECTORS.ICONS.emptyGroupWarning)).toHaveStyleRule(
				'color',
				theme.palette.warning.regular
			);
		});
	});

	it('should display the icon outlined if the group is not active', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const calendar = generateFolder({ view: 'appointment', checked: false });
		const groups = [generateGroup({ calendarId: [calendar.id] })];
		populateGroupsStore({
			groups
		});
		const item = { id: groups[0].id };

		setupTest(<GroupAccordionItem item={item} />, { store });

		expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendarGroup)).toBeVisible();
	});

	it('should display the icon filled if the group is active', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const calendar = generateFolder({ view: 'appointment', checked: true });
		const groups = [generateGroup({ calendarId: [calendar.id] })];

		populateFoldersStore({ customFolders: [calendar] });
		populateGroupsStore({
			groups
		});
		const item = { id: groups[0].id };

		setupTest(<GroupAccordionItem item={item} />, { store });

		expect(screen.getByTestId(TEST_SELECTORS.ICONS.selectedCalendarGroup)).toBeVisible();
	});

	it('should call the onClick callback when clicked on active group', async () => {
		const apiInterceptor = createSoapAPIInterceptor('Batch', generateSoapErrorResponseBody());

		const store = configureStore({ reducer: combineReducers(reducers) });
		const calendar = generateFolder({ view: 'appointment', checked: true });
		const groups = [generateGroup({ calendarId: [calendar.id] })];

		populateFoldersStore({ customFolders: [calendar] });
		populateGroupsStore({
			groups
		});
		const item = { id: groups[0].id };

		const { user } = setupTest(<GroupAccordionItem item={item} />, { store });
		user.click(screen.getByText(groups[0].name));
		const paramsSent = await apiInterceptor;

		expect(paramsSent).toEqual({
			FolderActionRequest: [
				{ _jsns: 'urn:zimbraMail', action: { id: calendar.id, op: '!check' }, requestId: 0 }
			],
			_jsns: 'urn:zimbra',
			onerror: 'continue'
		});
	});

	it('should call the onClick callback when clicked on not active group', async () => {
		const apiInterceptor = createSoapAPIInterceptor('Batch', generateSoapErrorResponseBody());

		const store = configureStore({ reducer: combineReducers(reducers) });
		const calendar = generateFolder({ view: 'appointment', checked: false });
		const groups = [generateGroup({ calendarId: [calendar.id] })];

		populateFoldersStore({ customFolders: [calendar] });
		populateGroupsStore({
			groups
		});
		const item = { id: groups[0].id };

		const { user } = setupTest(<GroupAccordionItem item={item} />, { store });
		user.click(screen.getByText(groups[0].name));
		const paramsSent = await apiInterceptor;

		expect(paramsSent).toEqual({
			FolderActionRequest: [
				{ _jsns: 'urn:zimbraMail', action: { id: calendar.id, op: 'check' }, requestId: 0 }
			],
			_jsns: 'urn:zimbra',
			onerror: 'continue'
		});
	});
});
