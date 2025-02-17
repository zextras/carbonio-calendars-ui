/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { useTheme } from 'styled-components';

import { CustomEventFreeBusyStatus } from './custom-event-free-busy-status';
import { setupHook, setupTest } from '../../carbonio-ui-commons/test/test-setup';

describe('CustomEventFreeBusyStatus', () => {
	const { result } = setupHook(useTheme);
	const calendarColor = 'red';
	const backgroundColor = 'blue';
	const repeatingGradientColor = `repeating-linear-gradient(45deg,
				${calendarColor},
				${calendarColor} 8px,
				${backgroundColor},
				${backgroundColor} 10px)`;

	test.each`
		freeBusyActual | background
		${'F'}         | ${result.current.palette.white.regular}
		${'B'}         | ${calendarColor}
		${'O'}         | ${result.current.palette.gray2.regular}
		${'T'}         | ${repeatingGradientColor}
		${undefined}   | ${calendarColor}
	`(
		'it should render a different style depending on its freeBusyActual status',
		({ freeBusyActual, background }) => {
			setupTest(
				<CustomEventFreeBusyStatus
					color={'red'}
					background={'blue'}
					freeBusyActual={freeBusyActual}
				/>
			);

			expect(screen.getByTestId('calendar-event')).toHaveStyle(`background-color: ${background}`);
			expect(screen.getByTestId('calendar-event')).toHaveStyle(
				`border: 0.0625rem solid ${calendarColor}`
			);
		}
	);
});
