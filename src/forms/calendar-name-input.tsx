/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CalendarNameErrors } from './error-codes';
import { InputType } from './types';

export const CalendarNameInput = ({
	value,
	onChange,
	errors
}: InputType<string, CalendarNameErrors>): React.JSX.Element => {
	const [t] = useTranslation();
	const duplicateNameError = t(
		'folder.modal.new.duplicate_warning',
		'A calendar with the same name already exists'
	);
	const hasError = !isEmpty(errors);
	const error = useMemo((): string | undefined => {
		if (hasError) {
			return duplicateNameError;
		}
		return undefined;
	}, [duplicateNameError, hasError]);

	return (
		<Input
			label={t('label.type_name_here', 'Calendar name')}
			backgroundColor="gray5"
			value={value}
			onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
				onChange(e.target.value);
			}}
			hasError={hasError}
			description={error}
		/>
	);
};
