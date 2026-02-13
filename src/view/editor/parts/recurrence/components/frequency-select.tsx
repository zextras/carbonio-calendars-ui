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
	const [t] = useTranslation();

	const recurrenceContext = useContext(RecurrenceContext);
	const interval = recurrenceContext?.newStartValue?.interval?.ival ?? 1;
	const isIntervalPlural = interval > 1;

	const { repetitionItems } = useRecurrenceItems();
	const displayItems = useMemo(() => {
		if (!isIntervalPlural) {
			return repetitionItems;
		}

		return repetitionItems.map((repetitionItem) => {
			let pluralLabel;
			switch (repetitionItem.value) {
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
					pluralLabel = repetitionItem.label;
					break;
			}
			return { ...repetitionItem, label: pluralLabel };
		});
	}, [repetitionItems, isIntervalPlural, t]);

	const initialDisplayItem = useMemo(
		() => find(displayItems, { value: recurrenceContext?.frequency }) ?? displayItems[0],
		[displayItems, recurrenceContext]
	);

	useEffect(() => {
		if (initialDisplayItem) {
			const value = find(displayItems, { value: recurrenceContext?.frequency }) ?? displayItems[0];
			recurrenceContext?.setFrequency(value?.value);
		}
	}, [recurrenceContext, initialDisplayItem, displayItems]);

	const onFrequencyChange = useCallback<SingleSelectionOnChange>(
		(ev) => {
			if (ev) {
				recurrenceContext?.setFrequency?.(ev);
			}
		},
		[recurrenceContext]
	);

	return (
		<Select
			onChange={onFrequencyChange}
			items={displayItems}
			selection={initialDisplayItem}
			disablePortal
			data-testid={'frequency-selector'}
		/>
	);
};
