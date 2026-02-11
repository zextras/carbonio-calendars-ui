/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo } from 'react';

import { Select, SingleSelectionOnChange } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';

import { RecurrenceContext } from 'commons/recurrence-context';
import { useRecurrenceItems } from 'commons/use-recurrence-items';
import { RECURRENCE_FREQUENCY } from 'constants/recurrence';

export const FrequencySelect = (): ReactElement => {
	const context = useContext(RecurrenceContext);
	const { repetitionItemsV2: repetitionItems } = useRecurrenceItems();
	const [t] = useTranslation();

	// Get the interval value from context
	const interval = context?.newStartValue?.interval?.ival ?? 1;
	const isPlural = interval > 1;

	// Create items with pluralized labels when needed
	const displayItems = useMemo(() => {
		if (!isPlural) {
			return repetitionItems;
		}

		// Plural forms when interval > 1
		return repetitionItems.map((item) => {
			let pluralLabel;
			switch (item.value) {
				case RECURRENCE_FREQUENCY.DAILY:
					pluralLabel = t('repeat.days', 'Days');
					break;
				case RECURRENCE_FREQUENCY.WEEKLY:
					pluralLabel = t('repeat.weeks', 'Weeks');
					break;
				case RECURRENCE_FREQUENCY.MONTHLY:
					pluralLabel = t('repeat.months', 'Months');
					break;
				case RECURRENCE_FREQUENCY.YEARLY:
					pluralLabel = t('repeat.years', 'Years');
					break;
				default:
					pluralLabel = item.label;
					break;
			}
			return { ...item, label: pluralLabel };
		});
	}, [repetitionItems, isPlural, t]);

	const initialValue = useMemo(
		() => find(displayItems, { value: context?.frequency }) ?? displayItems[0],
		[displayItems, context]
	);

	useEffect(() => {
		if (initialValue) {
			const value = find(displayItems, { value: context?.frequency }) ?? displayItems[0];
			context?.setFrequency(value?.value);
		}
	}, [context, initialValue, displayItems]);

	const onChange = useCallback<SingleSelectionOnChange>(
		(ev) => {
			if (ev) {
				context?.setFrequency?.(ev);
			}
		},
		[context]
	);

	return <Select onChange={onChange} items={displayItems} selection={initialValue} disablePortal />;
};
