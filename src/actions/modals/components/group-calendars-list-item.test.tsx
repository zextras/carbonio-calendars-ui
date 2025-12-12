/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';

import { GroupCalendarsListItem } from './group-calendars-list-item';
import { TEST_SELECTORS } from '../../../constants/test-utils';
import { generateGroupCalendar } from '../../../test/generators/group';
import { setupTest, screen } from '@test-setup';

describe('Group calendars list item', () => {
	it('should render the name of the calendar', () => {
		const calendar = generateGroupCalendar();

		setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={vi.fn()} />);

		expect(screen.getByText(calendar.name)).toBeVisible();
	});

	it('should render the color of the calendar', () => {
		const calendar = generateGroupCalendar();

		setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={vi.fn()} />);

		const square = screen.getByTestId('colored-square');
		expect(square).toHaveStyleRule(
			'background',
			ZIMBRA_STANDARD_COLORS[Number(calendar.color)].hex
		);
	});

	it('should render a button to remove the calendar', () => {
		const calendar = generateGroupCalendar();

		setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={vi.fn()} />);

		expect(
			screen.getByRoleWithIcon('button', { name: /remove/i, icon: TEST_SELECTORS.ICONS.remove })
		).toBeVisible();
	});

	it('should call the callback when the remove button is clicked', async () => {
		const calendar = generateGroupCalendar();
		const onRemove = vi.fn();

		const { user } = setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={onRemove} />);
		await user.click(screen.getByRole('button', { name: /remove/i }));

		expect(onRemove).toHaveBeenCalledWith(calendar.id);
	});
});
