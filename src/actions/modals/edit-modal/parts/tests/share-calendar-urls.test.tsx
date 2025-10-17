/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { copyToClipboard } from '@zextras/carbonio-ui-commons';

import { CALENDARS_SHARE_LINK_TYPES } from '../../../../../constants/calendar';
import { TEST_SELECTORS } from '../../../../../constants/test-utils';
import { createCalendarShareURL } from '../../../../../utils/calendars-share';
import { getCarbonioDomain } from '../../../../../utils/domain';
import { ShareCalendarUrls } from '../share-calendar-urls';
import { setupTest, screen, within } from '@test-setup';

const ICS_BUTTON_LABEL = 'ICS URL';
const CALDAV_BUTTON_LABEL = 'CalDAV URL';
const WEBCAL_BUTTON_LABEL = 'WebCAL URL';

const BUTTONS = [
	{
		label: ICS_BUTTON_LABEL,
		type: CALENDARS_SHARE_LINK_TYPES.ics,
		tooltip: `Copy ICS url`
	},
	{
		label: WEBCAL_BUTTON_LABEL,
		type: CALENDARS_SHARE_LINK_TYPES.webcal,
		tooltip: `Copy WebCAL url`
	},
	{
		label: CALDAV_BUTTON_LABEL,
		type: CALENDARS_SHARE_LINK_TYPES.caldav,
		tooltip: `Copy CalDAV url`
	}
];

jest.mock('@zextras/carbonio-ui-commons', () => {
	const actual = jest.requireActual('@zextras/carbonio-ui-commons');
	return {
		__esModule: true,
		...actual,
		copyToClipboard: jest.fn().mockImplementation(() => Promise.resolve())
	};
});

describe('ShareCalendarUrl', () => {
	it('should render the title', () => {
		const calendarName = faker.word.words(3);

		setupTest(<ShareCalendarUrls calendarName={calendarName} />);

		expect(screen.getByText(/Public share URLs/i)).toBeVisible();
	});

	it('should render the text under the title', () => {
		const calendarName = faker.word.words(3);

		setupTest(<ShareCalendarUrls calendarName={calendarName} />);

		expect(
			screen.getByText(
				`You can quickly share ${calendarName} with your collaborators using one of these URLs:`
			)
		).toBeVisible();
	});

	it('should render the note text', () => {
		const calendarName = faker.word.words(3);

		setupTest(<ShareCalendarUrls calendarName={calendarName} />);
		expect(
			screen.getByText('Only your collaborators can access your data using these URLs.')
		).toBeVisible();
	});

	describe.each(BUTTONS)('$label url button', ({ label, type, tooltip }) => {
		it('should be rendered with the proper label and icon', () => {
			const calendarName = faker.word.words(3);

			setupTest(<ShareCalendarUrls calendarName={calendarName} />);

			expect(
				screen.getByRoleWithIcon('button', {
					name: label,
					icon: TEST_SELECTORS.ICONS.shareUrlButton
				})
			).toBeVisible();
		});

		it('should have a tooltip with the correct label', async () => {
			const calendarName = faker.word.words(3);

			const { user } = setupTest(<ShareCalendarUrls calendarName={calendarName} />);
			const button = screen.getByRole('button', { name: label });

			await user.hover(button);

			const tooltipEl = await screen.findByTestId('tooltip');
			expect(tooltipEl).toBeVisible();
			expect(tooltipEl).toHaveTextContent(tooltip);
		});

		it('should copy the url to the clipboard when clicked', async () => {
			const calendarName = faker.word.words(3);
			const userName = getUserAccount()?.name ?? '';
			const domain = getCarbonioDomain();
			const expectedUrl = createCalendarShareURL(type, {
				calendarName,
				user: userName,
				domain
			});

			const { user } = setupTest(<ShareCalendarUrls calendarName={calendarName} />);

			await user.click(screen.getByRole('button', { name: label }));

			expect(jest.mocked(copyToClipboard)).toHaveBeenCalledWith(expectedUrl);
		});

		it('should show a success snackbar when clicked', async () => {
			const calendarName = faker.word.words(3);

			const { user } = setupTest(<ShareCalendarUrls calendarName={calendarName} />);

			await user.click(screen.getByRole('button', { name: label }));
			const snackbar = screen.getByTestId('snackbar');

			expect(within(snackbar).getByText(`${label} copied`)).toBeVisible();
		});
	});
});
