/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, within } from '@testing-library/react';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { TimeTable } from '../time-table';

describe('Time Table', () => {
	it('should display email on first column', () => {
		const rows = [
			{
				email: 'test@test.com',
				freeBusy: []
			}
		];
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-0');
		expect(within(firstRow).getByText('test@test.com')).toBeVisible();
	});
});
