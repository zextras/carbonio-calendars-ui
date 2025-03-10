/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { CustomEventReplyIcons } from './custom-event-reply-icons';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { PARTICIPATION_STATUS } from '../../constants/api';

describe('CustomEventReplyIcons', () => {
	test('it wont render anything if iAmAttendee is false', () => {
		setupTest(
			<CustomEventReplyIcons
				participationStatus={PARTICIPATION_STATUS.NEED_ACTION}
				setIsOuterTooltipDisabled={jest.fn()}
				iAmAttendee={false}
			/>
		);

		expect(screen.queryByTestId(`icon: AlertCircleOutline`)).not.toBeInTheDocument();
	});
	test.each`
		participationStatusValue            | icon
		${PARTICIPATION_STATUS.NEED_ACTION} | ${'AlertCircleOutline'}
		${PARTICIPATION_STATUS.ACCEPTED}    | ${'CheckmarkCircle2Outline'}
		${PARTICIPATION_STATUS.DECLINED}    | ${'CloseCircleOutline'}
		${PARTICIPATION_STATUS.TENTATIVE}   | ${'QuestionMarkCircleOutline'}
	`(
		'it should render a different icon depending on participationStatusValue',
		({ participationStatusValue, icon }) => {
			setupTest(
				<CustomEventReplyIcons
					participationStatus={participationStatusValue}
					setIsOuterTooltipDisabled={jest.fn()}
					iAmAttendee
				/>
			);

			expect(screen.getByTestId(`icon: ${icon}`)).toBeVisible();
		}
	);
});
