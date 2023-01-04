/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalFooter, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import ModalHeader from '../../../../../carbonio-ui-commons/components/modals/modal-header';
import {
	selectEditorRecurrenceCount,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceUntilDate
} from '../../../../../store/selectors/editor';
import { RecurrenceContext } from '../contexts';
import DailyOptions from './daily-options';
import FrequencySelect from '../components/frequency-select';
import MonthlyOptions from './monthly-options';
import RecurrenceEndOptions from './recurrence-end-options';
import WeeklyOptions from './weekly-options';
import YearlyOptions from './yearly-options';

const setEndInitialValue = (count, until) => {
	if (count) return { count: { num: count } };
	if (until)
		return {
			until: {
				d: until
			}
		};
	return undefined;
};

const CustomRecurrenceModal = ({ editorId, callbacks, onClose }) => {
	const freq = useSelector(selectEditorRecurrenceFrequency(editorId));
	const count = useSelector(selectEditorRecurrenceCount(editorId));
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));
	const { onRecurrenceChange } = callbacks;

	const [frequency, setFrequency] = useState(freq);

	const [newStartValue, setNewStartValue] = useState();
	const [newEndValue, setNewEndValue] = useState(() => setEndInitialValue(count, until));

	const onConfirm = useCallback(() => {
		onRecurrenceChange({
			add: {
				rule: omitBy({ ...(newStartValue ?? {}), ...(newEndValue ?? {}), freq: frequency }, isNil)
			}
		});
		onClose();
		setNewStartValue(undefined);
		setNewEndValue(undefined);
	}, [onRecurrenceChange, newStartValue, newEndValue, frequency, onClose]);

	return (
		<RecurrenceContext.Provider
			value={{
				editorId,
				newStartValue,
				setNewStartValue,
				newEndValue,
				setNewEndValue,
				frequency,
				setFrequency
			}}
		>
			<ModalHeader title={t('label.custom_repeat', 'Custom Repeat')} onClose={onClose} />
			<Padding vertical="medium">
				<Text weight="bold" size="large">
					{t('label.repeat', 'Repeat')}
				</Text>
			</Padding>
			<FrequencySelect />
			<Padding vertical="small">
				<DailyOptions />
				<WeeklyOptions />
				<MonthlyOptions />
				<YearlyOptions />
			</Padding>
			<Padding vertical="medium">
				<Text weight="bold" size="large">
					{t('label.end', 'End')}
				</Text>
			</Padding>
			<Padding vertical="small">
				<RecurrenceEndOptions />
			</Padding>
			<ModalFooter onConfirm={onConfirm} confirmLabel={t('repeat.customize', 'Customize')} />
		</RecurrenceContext.Provider>
	);
};

export default CustomRecurrenceModal;
