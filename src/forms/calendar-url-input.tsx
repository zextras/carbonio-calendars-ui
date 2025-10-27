/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isEmpty } from 'lodash';

import { InputType } from './types';
import { URLErrors } from '../soap/types';

export const URLInput = ({
	value,
	onChange,
	errors
}: InputType<string, URLErrors>): React.JSX.Element => {
	const urlErrorHttpOrHttps = t(
		'label.url_http_or_https',
		'The URL should begin with “http://” or “https://”'
	);
	const urlErrorUnreachable = t(
		'label.url_unreachable',
		'This link is invalid, please try to modify it or paste a new one'
	);
	const urlErrorNotACalendar = t(
		'label.url_not_a_calendar',
		'This link is not a valid calendar resource, please modify it or paste a new one'
	);
	const error = useMemo((): string | undefined => {
		if (errors) {
			if (errors.must_begin_with_http_or_https) {
				return urlErrorHttpOrHttps;
			}
			if (errors.not_a_calendar) {
				return urlErrorNotACalendar;
			}
			if (errors.unreachable) {
				return urlErrorUnreachable;
			}
		}
		return undefined;
	}, [errors, urlErrorHttpOrHttps, urlErrorNotACalendar, urlErrorUnreachable]);
	const hasError = !isEmpty(errors);
	return (
		<>
			<Input
				label={t('label.url', 'URL')}
				backgroundColor="gray5"
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					onChange(e.target.value);
				}}
				hasError={hasError}
				description={error}
			/>
		</>
	);
};
