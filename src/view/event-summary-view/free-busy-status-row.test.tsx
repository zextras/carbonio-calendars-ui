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
import { InviteOrganizer } from '../../types/store/invite';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';

const organizerWith = (a: string, sentBy?: string): InviteOrganizer => ({
	a,
	d: a,
	url: a,
	sentBy
});

describe('free busy status row', () => {
	test.each`
		freeBusy  | organizer                                  | expected
		${'busy'} | ${organizerWith(shell.mockedAccount.name)} | ${/You set this appointment as/i}
		${'busy'} | ${organizerWith(faker.internet.email())}   | ${/The organizer set this appointment as/}
	`(
		'will render a different subject depending if the user is organizer or not',
		({ freeBusy, organizer, expected }) => {
			setupTest(<FreeBusyStatusRow freeBusy={freeBusy} organizer={organizer} />);
			expect(screen.getByText(expected)).toBeVisible();
		}
	);

	test.each`
		freeBusy  | organizer                                                          | expected
		${'busy'} | ${organizerWith(faker.internet.email(), shell.mockedAccount.name)} | ${/You set this appointment as/i}
		${'busy'} | ${organizerWith(faker.internet.email(), faker.internet.email())}   | ${/The organizer set this appointment as/}
	`(
		'will attribute the appointment to the delegate when it is created on behalf of the organizer',
		({ freeBusy, organizer, expected }) => {
			setupTest(<FreeBusyStatusRow freeBusy={freeBusy} organizer={organizer} />);
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
			<FreeBusyStatusRow
				freeBusy={freeBusyValue}
				organizer={organizerWith(faker.internet.email())}
			/>
		);
		expect(screen.getByText(freeBusyText)).toBeVisible();
	});
});
