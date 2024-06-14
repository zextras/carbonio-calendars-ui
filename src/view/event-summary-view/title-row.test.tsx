/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { TitleRow } from './title-row';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import mockedData from '../../test/generators';

describe('title-row', () => {
	test('if the event is not part of a recurrence it wont have a recurrent icon', async () => {
		const event = mockedData.getEvent();

		setupTest(<TitleRow event={event} />);

		expect(screen.queryByTestId('icon: Repeat')).not.toBeInTheDocument();
	});
	test('if the event is part of a recurrence it will have a recurrent icon', async () => {
		const event = mockedData.getEvent({ resource: { isRecurrent: true } });

		setupTest(<TitleRow event={event} />);

		expect(screen.getByTestId('icon: Repeat')).toBeVisible();
	});
});
