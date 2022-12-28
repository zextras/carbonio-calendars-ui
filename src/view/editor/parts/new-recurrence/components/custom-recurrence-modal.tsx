/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ModalHeader from '../../../../../carbonio-ui-commons/components/modals/modal-header';
import { selectEditorRecurrenceFrequency } from '../../../../../store/selectors/editor';
import { RecurrenceContext } from '../contexts';
import DailyOptions from './daily-options';
import FrequencySelect from './frequency-select';
import WeeklyOptions from './weekly-options';

const CustomRecurrenceModal = ({ editorId, callbacks, onClose }) => {
	const freq = useSelector(selectEditorRecurrenceFrequency(editorId));

	const [frequency, setFrequency] = useState(freq);

	const [newStartValue, setNewStartValue] = useState();
	const [newEndValue, setNewEndValue] = useState();

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
			<FrequencySelect />
			<DailyOptions />
			<WeeklyOptions />
		</RecurrenceContext.Provider>
	);
};

export default CustomRecurrenceModal;
