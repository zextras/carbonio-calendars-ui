/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { setupHook } from '../carbonio-ui-commons/test/test-setup';

export const setupTMock = (): TFunction => {
	const {
		result: {
			current: [t]
		}
	} = setupHook(useTranslation);
	return t;
};
