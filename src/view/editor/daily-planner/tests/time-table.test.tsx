/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, within } from '@testing-library/react';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { TimeTable } from '../time-table';
import { DailyPlannerRow } from '../types';

describe('Time Table', () => {
	const rows: DailyPlannerRow[] = [
		{
			email: 'test@test.com',
			participantType: 'organizer',
			freeBusy: []
		}
	];
	it('should display email on first column of a row', () => {
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-test@test.com');
		const firstColumn = within(firstRow).getByTestId('column-0');
		expect(within(firstColumn).getByText('test@test.com')).toBeVisible();
	});

	it('should display start mark on a second column of a row', () => {
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-test@test.com');
		const secondColumn = within(firstRow).getByTestId('column-1');
		expect(within(secondColumn).getByTestId('start-mark')).toBeVisible();
	});
});
