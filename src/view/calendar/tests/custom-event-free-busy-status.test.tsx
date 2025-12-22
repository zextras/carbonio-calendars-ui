/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';

import { EVENT_DISPLAY_STATUS } from '../../../constants/api';
import { CustomEventFreeBusyStatus } from '../custom-event-free-busy-status';
import { setupHook, setupTest } from '@test-setup';

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
		freeBusyActual                        | background
		${EVENT_DISPLAY_STATUS.FREE}          | ${result.current.palette.white.regular}
		${EVENT_DISPLAY_STATUS.BUSY}          | ${calendarColor}
		${EVENT_DISPLAY_STATUS.OUT_OF_OFFICE} | ${result.current.palette.gray2.regular}
		${EVENT_DISPLAY_STATUS.TENTATIVE}     | ${repeatingGradientColor}
		${undefined}                          | ${calendarColor}
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

			const calendarItem = screen.getByTestId('calendar-event');
			expect(calendarItem).toHaveStyle({ background });
			expect(calendarItem.style.border).toContain(calendarColor);
		}
	);
});
