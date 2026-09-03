/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { act } from 'react';

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

	it('renders the owner email on its own line when the resource has an owner', () => {
		setupTest(
			<CalendarResourceHeader
				index={0}
				label="Calendar A"
				resource={{
					id: 'cal-a',
					title: 'Calendar A',
					color: 1,
					owner: 'shared.account@zextras.com'
				}}
			/>
		);

		expect(screen.getByText('Calendar A')).toBeVisible();
		expect(screen.getByText('shared.account@zextras.com')).toBeVisible();
	});

	it('does not render an owner when the resource has none', () => {
		setupTest(
			<CalendarResourceHeader
				index={0}
				label="Calendar A"
				resource={{ id: 'cal-a', title: 'Calendar A', color: 1 }}
			/>
		);

		expect(screen.queryByText(/@/)).not.toBeInTheDocument();
	});

	it('shows a tooltip with the calendar name for a resource without an owner', async () => {
		const { user } = setupTest(
			<CalendarResourceHeader
				index={0}
				label="Calendar A"
				resource={{ id: 'cal-a', title: 'Calendar A', color: 1 }}
			/>
		);

		await user.hover(screen.getByText('Calendar A'));
		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect((await screen.findAllByText('Calendar A')).length).toBeGreaterThan(1);
	});

	it('shows a tooltip with the calendar name and owner for a resource with an owner', async () => {
		const { user } = setupTest(
			<CalendarResourceHeader
				index={0}
				label="Delegated calendar"
				resource={{
					id: 'cal-a',
					title: 'Delegated calendar',
					color: 1,
					owner: 'shared.account@zextras.com'
				}}
			/>
		);

		await user.hover(screen.getByText('Delegated calendar'));
		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(
			await screen.findByText('Delegated calendar (shared.account@zextras.com)')
		).toBeVisible();
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
