/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { ShareCalendarUrls } from '../share-calendar-urls';
import { setupTest, screen } from '@test-setup';

describe('ShareCalendarUrl', () => {
	it('should render the title', () => {
		const calendarName = faker.word.words(3);

		setupTest(<ShareCalendarUrls calendarName={calendarName} />);

		expect(screen.getByText(/access share/i)).toBeVisible();
	});
});
