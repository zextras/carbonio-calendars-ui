/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { ReactElement, useCallback, useContext, useMemo } from 'react';
import { t } from '@zextras/carbonio-shell-ui';
import { RecurrenceContext } from '../../../../../commons/recurrence-context';
import { useRecurrenceItems } from '../../../../../commons/use-recurrence-items';

const FrequencySelect = (): ReactElement => {
	const context = useContext(RecurrenceContext);

	const { repetitionItems } = useRecurrenceItems();

	const initialValue = useMemo(() => {
		const value = find(repetitionItems, { value: context?.frequency }) ?? repetitionItems[0];
		context?.setFrequency(value?.value);
		return value;
	}, [repetitionItems, context]);

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
