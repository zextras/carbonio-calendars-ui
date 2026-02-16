/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useState } from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { FrequencySelect } from './frequency-select';
import { IntervalInput } from './interval-input';
import { RecurrenceContext } from 'commons/recurrence-context';
import { useAppSelector } from 'store/redux/hooks';
import { selectEditorRecurrenceInterval } from 'store/selectors/editor';

type RepeatEveryRowProps = {
	editorId: string;
};

export const RepeatEveryRow = ({ editorId }: RepeatEveryRowProps): ReactElement => {
	const recurrenceContext = useContext(RecurrenceContext);

	const editorRecurrenceInterval = useAppSelector(selectEditorRecurrenceInterval(editorId));

	const [intervalValue, setIntervalValue] = useState(() =>
		editorRecurrenceInterval?.ival ? editorRecurrenceInterval.ival.toString() : '1'
	);

	const handleIntervalChange = useCallback(
		(value: number) => {
			if (recurrenceContext?.setNewStartValue) {
				recurrenceContext.setNewStartValue((prevValue) => ({
					...prevValue,
					interval: {
						ival: value
					}
				}));
			}
		},
		[recurrenceContext]
	);

	const VERTICAL_ORIENTATION = 'vertical' as const;
	const FLEX_START_ALIGNMENT = 'flex-start' as const;

	return (
		<Container
			orientation="horizontal"
			mainAlignment={FLEX_START_ALIGNMENT}
			crossAlignment="center"
			gap="small"
		>
			<Container orientation={VERTICAL_ORIENTATION} crossAlignment={FLEX_START_ALIGNMENT}>
				<Text>{t('label.repeat_every', 'Repeat every')}</Text>
			</Container>

			<Container
				orientation={VERTICAL_ORIENTATION}
				crossAlignment={FLEX_START_ALIGNMENT}
				width={'fit'}
				padding={{ right: 'large' }}
			>
				<IntervalInput
					label=""
					value={intervalValue}
					setValue={setIntervalValue}
					onChange={handleIntervalChange}
					disabled={false}
				/>
			</Container>

			<Container
				orientation={VERTICAL_ORIENTATION}
				crossAlignment={FLEX_START_ALIGNMENT}
				width={'fill'}
			>
				<FrequencySelect editorId={editorId} />
			</Container>
		</Container>
	);
};
