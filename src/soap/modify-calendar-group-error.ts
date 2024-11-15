/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';

import { ApiError } from './api-error';

export class ModifyCalendarGroupError extends ApiError {
	private static GROUP_NAME_ALREADY_EXISTS = 'calendargroup.GROUP_NAME_ALREADY_EXIST';

	getLocalizedMessage(t: TFunction): string {
		if (this.fault.Detail.Error.Code === ModifyCalendarGroupError.GROUP_NAME_ALREADY_EXISTS) {
			return t(
				'api.error.ModifyCalendarGroup.group_name_already_exists',
				'A group with the same name already exists'
			);
		}

		return ApiError.getDefaultLocalizedMessage(t);
	}
}
