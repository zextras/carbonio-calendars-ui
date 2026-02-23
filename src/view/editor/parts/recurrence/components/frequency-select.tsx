/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo } from 'react';

import { Select, SingleSelectionOnChange } from '@zextras/carbonio-design-system';
import { find } from 'lodash';

import { RecurrenceContext } from 'commons/recurrence-context';
import { useRecurrenceItems } from 'commons/use-recurrence-items';
import { useAppSelector } from 'store/redux/hooks';
import { selectEditorRecurrenceFrequency } from 'store/selectors/editor';

type FrequencySelectProps = {
	editorId: string;
};

export const FrequencySelect = ({ editorId }: FrequencySelectProps): ReactElement => {
	const recurrenceContext = useContext(RecurrenceContext);
	const editorEventRecurrenceFrequency = useAppSelector(selectEditorRecurrenceFrequency(editorId));

	const { repetitionItems } = useRecurrenceItems();

	const selectedItem = useMemo(() => {
		const value = recurrenceContext?.frequency ?? editorEventRecurrenceFrequency;
		return find(repetitionItems, { value }) ?? repetitionItems[0];
	}, [repetitionItems, recurrenceContext?.frequency, editorEventRecurrenceFrequency]);

	// Initialize context frequency on mount if not already set
	useEffect(() => {
		if (!recurrenceContext?.frequency && recurrenceContext?.setFrequency) {
			const initialFrequency = editorEventRecurrenceFrequency ?? repetitionItems[0]?.value;
			if (initialFrequency) {
				recurrenceContext.setFrequency(initialFrequency);
			}
		}
	}, [repetitionItems, editorEventRecurrenceFrequency, recurrenceContext]);

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
			items={repetitionItems}
			selection={selectedItem}
			disablePortal
			data-testid={'frequency-selector'}
		/>
	);
};
