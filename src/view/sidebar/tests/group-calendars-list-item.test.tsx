/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateGroupCalendar } from '../../../test/generators/group';
import { GroupCalendarsListItem } from '../group-calendars-list-item';
import 'jest-styled-components';

describe('Group calendars list item', () => {
	it('should render the name of the calendar', () => {
		const calendar = generateGroupCalendar();

		setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={jest.fn()} />);

		expect(screen.getByText(calendar.name)).toBeVisible();
	});

	it('should render the color of the calendar', () => {
		const calendar = generateGroupCalendar();

		setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={jest.fn()} />);

		const square = screen.getByTestId('colored-square');
		expect(square).toHaveStyleRule(
			'background',
			ZIMBRA_STANDARD_COLORS[Number(calendar.color.color)].hex
		);
	});

	it('should render a button to remove the calendar', () => {
		const calendar = generateGroupCalendar();

		setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={jest.fn()} />);

		expect(screen.getByRole('button', { name: /remove/i })).toBeVisible();
	});

	it('should call the callback when the remove button is clicked', async () => {
		const calendar = generateGroupCalendar();
		const onRemove = jest.fn();

		const { user } = setupTest(<GroupCalendarsListItem calendar={calendar} onRemove={onRemove} />);
		await user.click(screen.getByRole('button', { name: /remove/i }));

		expect(onRemove).toHaveBeenCalledWith(calendar.id);
	});
});
