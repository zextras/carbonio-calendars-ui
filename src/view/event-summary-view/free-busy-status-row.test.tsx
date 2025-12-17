/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';

import { FreeBusyStatusRow } from './free-busy-status-row';
import { EVENT_DISPLAY_STATUS } from '../../constants/api';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';

describe('free busy status row', () => {
	test.each`
		freeBusy  | organizerName               | expected
		${'busy'} | ${shell.mockedAccount.name} | ${/You set this appointment as/i}
		${'busy'} | ${faker.internet.email()}   | ${/The organizer set this appointment as/}
	`(
		'will render a different subject depending if the user is organizer or not',
		({ freeBusy, organizerName, expected }) => {
			setupTest(<FreeBusyStatusRow freeBusy={freeBusy} organizerName={organizerName} />);
			expect(screen.getByText(expected)).toBeVisible();
		}
	);
	test.each`
		freeBusyText        | freeBusyValue
		${/busy/i}          | ${EVENT_DISPLAY_STATUS.BUSY}
		${/free/i}          | ${EVENT_DISPLAY_STATUS.FREE}
		${/tentative/i}     | ${EVENT_DISPLAY_STATUS.TENTATIVE}
		${/out of office/i} | ${EVENT_DISPLAY_STATUS.OUT_OF_OFFICE}
	`('will render a different status', ({ freeBusyText, freeBusyValue }) => {
		setupTest(
			<FreeBusyStatusRow freeBusy={freeBusyValue} organizerName={faker.internet.email()} />
		);
		expect(screen.getByText(freeBusyText)).toBeVisible();
	});
});
