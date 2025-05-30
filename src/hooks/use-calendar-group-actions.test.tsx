/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { useCalendarGroupDeleteActionFn } from './use-calendar-group-actions';
import { screen, setupHook } from '@zextras/carbonio-ui-commons';
import { MODAL_ANIMATION_DURATION } from '../constants/test-utils';

describe('useCalendarGroupActions', () => {
	describe('useCalendarGroupDeleteActionFn', () => {
		it('should return a function that opens a delete group modal', () => {
			const calendarGroupId = faker.number.int().toString();
			const {
				result: { current: deleteGroup }
			} = setupHook(useCalendarGroupDeleteActionFn, {
				initialProps: [calendarGroupId]
			});

			act(() => deleteGroup());
			act(() => jest.advanceTimersByTime(MODAL_ANIMATION_DURATION));

			expect(screen.getByText('Delete group permanently?')).toBeVisible();
		});
	});
});
