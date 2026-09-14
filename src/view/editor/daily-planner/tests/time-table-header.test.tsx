/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { TimetableHeader } from '../time-table-header';
import { TIME_FORMAT_24_HOUR_PREF_NAME } from '../../../../commons/time-format';
import { setupTest } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';

describe('TimetableHeader', () => {
	it('renders a repeated 12-hour clock face by default', () => {
		setupTest(<TimetableHeader />);

		expect(screen.getAllByText('12')).toHaveLength(3);
		expect(screen.getAllByText('1')).toHaveLength(2);
	});

	it('renders a single 0-24 hour axis when the time format pref is TRUE', () => {
		shell.useUserSettings.mockReturnValueOnce({
			...defaultSettings,
			prefs: { ...defaultSettings.prefs, [TIME_FORMAT_24_HOUR_PREF_NAME]: 'TRUE' }
		});
		setupTest(<TimetableHeader />);

		expect(screen.getByText('0')).toBeVisible();
		expect(screen.getByText('13')).toBeVisible();
		expect(screen.getByText('23')).toBeVisible();
		expect(screen.getByText('24')).toBeVisible();
		// getByText throws on more than one match, so this also proves '12' appears exactly once.
		expect(screen.getByText('12')).toBeVisible();
	});
});
