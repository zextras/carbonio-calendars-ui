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
import { useAppSelector } from 'store/redux/hooks';
import {
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceInterval
} from 'store/selectors/editor';

type FrequencySelectProps = {
	editorId: string;
};

export const FrequencySelect = ({ editorId }: FrequencySelectProps): ReactElement => {
	const [t] = useTranslation();

	const recurrenceContext = useContext(RecurrenceContext);
	const editorEventRecurrenceInterval = useAppSelector(selectEditorRecurrenceInterval(editorId));
	const editorEventRecurrenceFrequency = useAppSelector(selectEditorRecurrenceFrequency(editorId));

	// Read interval from context first (for live updates), fallback to editor state, default to 1
	const interval =
		recurrenceContext?.newStartValue?.interval?.ival ?? editorEventRecurrenceInterval?.ival ?? 1;
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

	// Initialize from editor frequency only once
	const [selectedItem, setSelectedItem] = React.useState(
		() => find(displayItems, { value: editorEventRecurrenceFrequency }) ?? displayItems[0]
	);

	// Update selected item when displayItems change (e.g., plural/singular)
	useEffect(() => {
		const newItem = find(displayItems, { value: selectedItem.value });
		if (newItem) {
			setSelectedItem(newItem);
		}
	}, [displayItems, selectedItem.value]);

	// Initialize context frequency from editor state only once
	useEffect(() => {
		if (selectedItem && recurrenceContext?.setFrequency) {
			recurrenceContext.setFrequency(selectedItem.value);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onFrequencyChange = useCallback<SingleSelectionOnChange>(
		(ev) => {
			if (ev) {
				const newItem = find(displayItems, { value: ev });
				if (newItem) {
					setSelectedItem(newItem);
				}
				recurrenceContext?.setFrequency?.(ev);
			}
		},
		[recurrenceContext, displayItems]
	);

	return (
		<Select
			onChange={onFrequencyChange}
			items={displayItems}
			selection={selectedItem}
			disablePortal
			data-testid={'frequency-selector'}
		/>
	);
};
