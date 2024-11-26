/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapFault } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';

export abstract class ApiError extends Error {
	constructor(protected fault: SoapFault) {
		super(fault.Reason.Text);
	}

	public static getDefaultLocalizedMessage(t: TFunction): string {
		return t('label.error_try_again', 'Something went wrong, please try again');
	}

	public abstract getLocalizedMessage(t: TFunction): string;
}
