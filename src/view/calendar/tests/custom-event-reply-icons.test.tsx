/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { PARTICIPATION_STATUS } from '../../../constants/api';
import { CustomEventReplyIcons } from '../custom-event-reply-icons';
import { setupTest } from '@test-setup';

describe('CustomEventReplyIcons', () => {
	test('it wont render anything if iAmAttendee is false', () => {
		setupTest(
			<CustomEventReplyIcons
				participationStatus={PARTICIPATION_STATUS.NEED_ACTION}
				iAmAttendee={false}
			/>
		);

		expect(screen.queryByTestId(`icon: CalendarWarning`)).not.toBeInTheDocument();
	});
	test.each`
		participationStatusValue            | icon
		${PARTICIPATION_STATUS.NEED_ACTION} | ${'CalendarWarning'}
		${PARTICIPATION_STATUS.ACCEPTED}    | ${'StatusAccept'}
		${PARTICIPATION_STATUS.DECLINED}    | ${'StatusDenied'}
		${PARTICIPATION_STATUS.TENTATIVE}   | ${'StatusMaybe'}
	`(
		'it should render a different icon depending on participationStatusValue',
		({ participationStatusValue, icon }) => {
			setupTest(
				<CustomEventReplyIcons participationStatus={participationStatusValue} iAmAttendee />
			);

			expect(screen.getByTestId(`icon: ${icon}`)).toBeVisible();
		}
	);
});
