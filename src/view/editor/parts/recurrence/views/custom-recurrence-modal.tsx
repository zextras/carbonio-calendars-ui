/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Divider, ModalBody, ModalFooter, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';
import React, { ReactElement, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import ModalHeader from '../../../../../carbonio-ui-commons/components/modals/modal-header';
import {
	selectEditorRecurrenceCount,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceUntilDate
} from '../../../../../store/selectors/editor';
import {
	EditorCallbacks,
	RecurrenceEndValue,
	RecurrenceStartValue
} from '../../../../../types/editor';
import DailyOptions from './daily-options';
import FrequencySelect from '../components/frequency-select';
import MonthlyOptions from './monthly-options';
import RecurrenceEndOptions from './recurrence-end-options';
import WeeklyOptions from './weekly-options';
import YearlyOptions from './yearly-options';
import { RecurrenceContext } from '../../../../../commons/recurrence-context';

const setEndInitialValue = (
	count: number | undefined,
	until: string | undefined
): RecurrenceEndValue => {
	if (count) return { count: { num: count } };
	if (until)
		return {
			until: {
				d: until
			}
		};
	return undefined;
};

type CustomRecurrenceModalProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	onClose: () => void;
};

const CustomRecurrenceModal = ({
	editorId,
	callbacks,
	onClose
}: CustomRecurrenceModalProps): ReactElement => {
	const freq = useSelector(selectEditorRecurrenceFrequency(editorId));
	const count = useSelector(selectEditorRecurrenceCount(editorId));
	const until = useSelector(selectEditorRecurrenceUntilDate(editorId));
	const { onRecurrenceChange } = callbacks;

	const [frequency, setFrequency] = useState(freq);

	const [newStartValue, setNewStartValue] = useState<RecurrenceStartValue>();
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

	const recurrenceContextValue = {
		newStartValue,
		setNewStartValue,
		newEndValue,
		setNewEndValue,
		frequency,
		setFrequency
	};

	return (
		<RecurrenceContext.Provider value={recurrenceContextValue}>
			<ModalHeader title={t('label.custom_repeat', 'Custom Repeat')} onClose={onClose} />
			<ModalBody>
				<Text weight="bold" size="large">
					{t('label.repeat', 'Repeat')}
				</Text>
				<Padding top="small" />
				<FrequencySelect />
				<Padding vertical="small">
					<DailyOptions editorId={editorId} />
					<WeeklyOptions editorId={editorId} />
					<MonthlyOptions />
					<YearlyOptions />
				</Padding>
				<Padding vertical="medium">
					<Text weight="bold" size="large">
						{t('label.end', 'End')}
					</Text>
				</Padding>
				<Padding vertical="small">
					<RecurrenceEndOptions editorId={editorId} />
				</Padding>
			</ModalBody>
			<Divider />
			<ModalFooter onConfirm={onConfirm} confirmLabel={t('repeat.customize', 'Customize')} />
		</RecurrenceContext.Provider>
	);
};

export default CustomRecurrenceModal;
