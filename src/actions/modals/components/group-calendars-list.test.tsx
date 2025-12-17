/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { times } from 'lodash';

import { GroupCalendarsList } from './group-calendars-list';
import { generateGroupCalendar } from '../../../test/generators/group';
import { setupTest } from '@test-setup';

describe('Group calendars list', () => {
	it('should render a placeholder text when there is no calendar', () => {
		setupTest(<GroupCalendarsList calendars={[]} onCalendarRemove={vi.fn()} />);

		expect(screen.getByText('There are no calendars in this group yet.')).toBeVisible();
	});

	it('should render a gray colored placeholder text', () => {
		setupTest(<GroupCalendarsList calendars={[]} onCalendarRemove={vi.fn()} />);

		const placeholderText = screen.getByText('There are no calendars in this group yet.');

		expect(placeholderText).toHaveStyleRule('color', '#828282');
	});

	it('should not render a placeholder text when there is at least one calendar', () => {
		const calendars = [generateGroupCalendar()];

		setupTest(<GroupCalendarsList calendars={calendars} onCalendarRemove={vi.fn()} />);

		expect(
			screen.queryByText(
				'There are no calendars in this group yet. Start typing the calendars in the input, then click “+” to add them to the group.'
			)
		).not.toBeInTheDocument();
	});

	it('should render the names of all given calendars', () => {
		const calendars = times(42, (index) => generateGroupCalendar({ name: `Calendar ${index}` }));

		setupTest(<GroupCalendarsList calendars={calendars} onCalendarRemove={vi.fn()} />);

		calendars.forEach((calendar) => {
			expect(screen.getByText(calendar.name)).toBeVisible();
		});
	});

	it('should call the onCalendarRemove callback when a calendar is removed', async () => {
		const calendars = [generateGroupCalendar()];

		const onCalendarRemove = vi.fn();
		const { user } = setupTest(
			<GroupCalendarsList calendars={calendars} onCalendarRemove={onCalendarRemove} />
		);
		const removeButton = screen.getByRole('button', { name: /remove/i });

		await user.click(removeButton);

		expect(onCalendarRemove).toHaveBeenCalledWith(calendars[0].id);
	});
});
