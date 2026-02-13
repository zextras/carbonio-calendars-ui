/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useState } from 'react';

import { Divider, ModalBody, ModalHeader, Padding, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { ModalFooter } from '@zextras/carbonio-ui-commons';
import { isNil, omitBy } from 'lodash';

import { MonthlyOptions } from './monthly-options';
import { RecurrenceEndOptions } from './recurrence-end-options';
import { WeeklyOptions } from './weekly-options';
import { RecurrenceContext } from 'commons/recurrence-context';
import { useAppDispatch, useAppSelector } from 'store/redux/hooks';
import {
	selectEditorRecurrenceCount,
	selectEditorRecurrenceFrequency,
	selectEditorRecurrenceUntilDate
} from 'store/selectors/editor';
import { editEditorRecurrence } from 'store/slices/editor-slice';
import { RecurrenceEndValue, RecurrenceStartValue } from 'types/editor';
import { RepeatEveryRow } from 'view/editor/parts/recurrence/components/repeat-every-row';

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
	onClose: () => void;
};

export const CustomRecurrenceModal = ({
	editorId,
	onClose
}: CustomRecurrenceModalProps): ReactElement => {
	const editorEventRecurrenceFrequency = useAppSelector(selectEditorRecurrenceFrequency(editorId));
	const editorEventRecurrenceCount = useAppSelector(selectEditorRecurrenceCount(editorId));
	const editorEventRecurrenceUntilDate = useAppSelector(selectEditorRecurrenceUntilDate(editorId));

	const [frequency, setFrequency] = useState(editorEventRecurrenceFrequency);
	const [newStartValue, setNewStartValue] = useState<RecurrenceStartValue>();
	const [newEndValue, setNewEndValue] = useState(() =>
		setEndInitialValue(editorEventRecurrenceCount, editorEventRecurrenceUntilDate)
	);

	const dispatch = useAppDispatch();

	const confirmCustomRepeat = useCallback(() => {
		const recur = {
			add: {
				rule: omitBy({ ...(newStartValue ?? {}), ...(newEndValue ?? {}), freq: frequency }, isNil)
			}
		};
		dispatch(editEditorRecurrence({ id: editorId, recur }));
		onClose();
	}, [newStartValue, newEndValue, frequency, dispatch, editorId, onClose]);

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
			<ModalHeader
				title={t('label.custom_repeat', 'Custom Repeat')}
				showCloseIcon
				onClose={onClose}
				closeIconTooltip="Close"
			/>
			<Divider />
			<ModalBody>
				<RepeatEveryRow editorId={editorId} />
				<Padding vertical="small" width={'fill'}>
					<WeeklyOptions editorId={editorId} />
					<MonthlyOptions editorId={editorId} />
				</Padding>
				<Padding vertical="medium">
					<Text weight="bold" size="large">
						{t('label.end', 'End')}
					</Text>
				</Padding>
				<Padding vertical="small" width={'fill'}>
					<RecurrenceEndOptions editorId={editorId} />
				</Padding>
			</ModalBody>
			<ModalFooter
				onConfirm={confirmCustomRepeat}
				label={t('editor.repeat.set-custom-repeat', 'set custom repeat')}
				secondaryAction={onClose}
				secondaryLabel={t('label.cancel', 'Cancel')}
				secondaryBtnType={'outlined'}
				secondaryColor={'#414141'}
			/>
		</RecurrenceContext.Provider>
	);
};
