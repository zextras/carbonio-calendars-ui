/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';

import { TEST_SELECTORS } from '../../../../constants/test-utils';
import { CalendarChip } from '../calendar-chips';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('CalendarChip', () => {
	const calendar = generateFolder({
		id: faker.number.int({ min: 100 }).toString(),
		name: faker.word.words(2),
		color: faker.number.int({ min: 0, max: 9 })
	});

	const value = {
		id: calendar.id,
		label: calendar.name,
		onCalendarRemove: jest.fn()
	};

	beforeEach(() => {
		populateFoldersStore({ view: 'appointment', customFolders: [calendar] });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('renders the CalendarChip with the correct label and color', () => {
		setupTest(<CalendarChip value={value} />);

		expect(screen.getByText(calendar.name)).toBeInTheDocument();
		expect(screen.getByTestId(TEST_SELECTORS.ICONS.calendarChipAvatar)).toHaveStyle(
			`color: ${ZIMBRA_STANDARD_COLORS[calendar.color ?? 0].hex}`
		);
	});

	it('calls onCalendarRemove when the chip is closed', async () => {
		const { user } = setupTest(<CalendarChip value={value} />);

		await user.click(screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeChip }));

		expect(value.onCalendarRemove).toHaveBeenCalledWith(calendar.id);
	});

	it('does not render the chip if the calendar is not found', () => {
		populateFoldersStore({ view: 'appointment', customFolders: [] });

		const { container } = setupTest(<CalendarChip value={value} />);

		expect(container).toBeEmptyDOMElement();
	});
});
