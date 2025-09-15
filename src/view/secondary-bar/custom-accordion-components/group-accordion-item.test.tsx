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

			expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar)).toBeVisible();
			expect(screen.getByTestId(TEST_SELECTORS.ICONS.unSelectedCalendar)).toHaveStyleRule(
				'color',
				theme.palette.text.disabled
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

	it.todo('should display the icon outlined if the group is not active');

	it.todo('should display the icon filled if the group is active');

	it.todo('should call the onClick callback when clicked');
});
