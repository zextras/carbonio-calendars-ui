/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { CalendarGroup, Folder } from '../carbonio-ui-commons/types';

export const isGroupType = (item: Folder | CalendarGroup): item is CalendarGroup =>
	'calendarId' in item;

export const isCalendarType = (item: Folder | CalendarGroup): item is Folder => !isGroupType(item);

export const setupTMock = (): TFunction => {
	const {
		result: {
			current: [t]
		}
	} = setupHook(useTranslation);
	return t;
};
