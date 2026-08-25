/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';

import { CalendarResourceHeader } from '../calendar-resource-header';
import { CALENDARS_STANDARD_COLORS } from '../../../constants/calendar';
import { setupTest } from '@test-setup';

describe('CalendarResourceHeader', () => {
	it('renders the resource label', () => {
		setupTest(
			<CalendarResourceHeader
				index={0}
				label="Calendar A"
				resource={{ id: 'cal-a', title: 'Calendar A', color: 1 }}
			/>
		);

		expect(screen.getByText('Calendar A')).toBeVisible();
	});

	it("sets the resource's color as CSS variables on the closest .rbc-time-header-content ancestor", () => {
		const standardColor = CALENDARS_STANDARD_COLORS[1];
		const { container } = setupTest(
			<div className="rbc-time-header-content">
				<CalendarResourceHeader
					index={0}
					label="Calendar A"
					resource={{ id: 'cal-a', title: 'Calendar A', color: 1 }}
				/>
			</div>
		);

		// eslint-disable-next-line testing-library/no-node-access
		const columnWrapper = container.querySelector('.rbc-time-header-content') as HTMLElement;
		expect(columnWrapper.style.getPropertyValue('--rbc-slot-selection-border')).toBe(
			standardColor.color
		);
		expect(columnWrapper.style.getPropertyValue('--rbc-slot-selection-background')).toBe(
			standardColor.background
		);
	});

	it('does not throw when no .rbc-time-header-content ancestor is present', () => {
		expect(() =>
			setupTest(
				<CalendarResourceHeader
					index={0}
					label="Calendar A"
					resource={{ id: 'cal-a', title: 'Calendar A', color: 1 }}
				/>
			)
		).not.toThrow();
	});
});
