/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { GenericSoapApiError } from '@zextras/carbonio-ui-commons';
import { TFunction } from 'i18next';

export class CreateCalendarGroupError extends GenericSoapApiError {
	private static GROUP_NAME_ALREADY_EXISTS = 'calendargroup.GROUP_NAME_ALREADY_EXIST';

	override getLocalizedMessage(t: TFunction): string {
		if (this.fault.Detail.Error.Code === CreateCalendarGroupError.GROUP_NAME_ALREADY_EXISTS) {
			return t(
				'api.error.CreateCalendarGroup.group_name_already_exists',
				'A group with the same name already exists'
			);
		}

		return super.getLocalizedMessage(t);
	}
}
