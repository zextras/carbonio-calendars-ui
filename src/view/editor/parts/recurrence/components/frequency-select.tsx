/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';

const FrequencySelect = (): ReactElement => {
	const context = useContext(RecurrenceContext);
	const [t] = useTranslation();

	const { repetitionItems } = useRecurrenceItems();

	const initialValue = useMemo(
		() => find(repetitionItems, { value: context?.frequency }) ?? repetitionItems[0],
		[repetitionItems, context]
	);

	useEffect(() => {
		if (initialValue) {
			const value = find(repetitionItems, { value: context?.frequency }) ?? repetitionItems[0];
			context?.setFrequency(value?.value);
		}
	}, [context, initialValue, repetitionItems]);

	const onChange = useCallback(
		(ev) => {
			context?.setFrequency?.(ev);
		},
		[context]
	);

	return (
		<Select
			label={t('label.repeat', 'Repeat')}
			onChange={onChange}
			items={repetitionItems}
			selection={initialValue}
			disablePortal
		/>
	);
};

export default FrequencySelect;
