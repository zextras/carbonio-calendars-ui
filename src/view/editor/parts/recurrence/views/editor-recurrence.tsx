/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Icon,
	LabelFactoryProps,
	Row,
	Select,
	SingleSelectionOnChange,
	Text
} from '@zextras/carbonio-design-system';
import { find, toUpper } from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { ColorContainer, TextUpperCase } from '../../../../../commons/styled-components';
import { RECURRENCE_FREQUENCY } from '../../../../../constants/recurrence';
import { useAppDispatch, useAppSelector } from '../../../../../store/redux/hooks';
import {
	selectEditorDisabled,
	selectEditorRecurrence,
	selectEditorStart
} from '../../../../../store/selectors/editor';
import { editEditorRecurrence } from '../../../../../store/slices/editor-slice';
import { EditorProps } from '../../../../../types/editor';
import CustomRepeatSelectItem from '../components/custom-repeat';
import RepeatItemComponent from '../components/repeat-item-component';

const LabelFactory = ({ selected, label, open, focus }: LabelFactoryProps): ReactElement => (
	<ColorContainer
		orientation="horizontal"
		width="fill"
		crossAlignment="center"
		mainAlignment="space-between"
		borderRadius="half"
		background={'gray5'}
		padding={{
			all: 'small'
		}}
	>
		<Row width="100%" takeAvailableSpace mainAlignment="space-between">
			<Row
				orientation="vertical"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				padding={{ left: 'small' }}
			>
				<Text size="small" color={open || focus ? 'primary' : 'secondary'}>
					{label}
				</Text>
				<Row>
					<TextUpperCase>{selected[0].label}</TextUpperCase>
				</Row>
			</Row>
		</Row>
		<Icon
			size="large"
			icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
			color={open || focus ? 'primary' : 'secondary'}
			style={{ alignSelf: 'center' }}
		/>
	</ColorContainer>
);

export const EditorRecurrence = ({ editorId }: EditorProps): ReactElement | null => {
	const recur = useAppSelector(selectEditorRecurrence(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const [t] = useTranslation();
	const start = useAppSelector(selectEditorStart(editorId));
	const dispatch = useAppDispatch();

	const recurrenceItems = useMemo(
		() => [
			{
				label: t('label.none', 'None'),
				value: RECURRENCE_FREQUENCY.NEVER,
				customComponent: <RepeatItemComponent label={t('label.none', 'None')} />
			},
			{
				label: t('label.every_day', 'Every day'),
				value: RECURRENCE_FREQUENCY.DAILY,
				customComponent: <RepeatItemComponent label={t('label.every_day', 'Every day')} />
			},
			{
				label: t('repeat.everyWeek', 'Every Week'),
				value: RECURRENCE_FREQUENCY.WEEKLY,
				customComponent: <RepeatItemComponent label={t('repeat.everyWeek', 'Every Week')} />
			},
			{
				label: t('repeat.everyMonth', 'Every Month'),
				value: RECURRENCE_FREQUENCY.MONTHLY,
				customComponent: <RepeatItemComponent label={t('repeat.everyMonth', 'Every Month')} />
			},
			{
				label: t('repeat.everyYear', 'Every Year'),
				value: RECURRENCE_FREQUENCY.YEARLY,
				customComponent: <RepeatItemComponent label={t('repeat.everyYear', 'Every Year')} />
			},
			{
				label: t('label.custom', 'Custom'),
				value: RECURRENCE_FREQUENCY.CUSTOM,
				customComponent: <CustomRepeatSelectItem editorId={editorId} />
			}
		],
		[editorId, t]
	);

	const initialValue = useMemo(() => {
		const recurrenceValue = recur ? RECURRENCE_FREQUENCY.CUSTOM : RECURRENCE_FREQUENCY.NEVER;
		return find(recurrenceItems, { value: recurrenceValue }) ?? recurrenceItems[0];
	}, [recur, recurrenceItems]);

	const [selected, setSelected] = useState(initialValue);

	const onChange = useCallback<SingleSelectionOnChange>(
		(ev) => {
			if (ev) {
				const defaultValue = { freq: ev, interval: [{ ival: 1 }] };
				switch (ev) {
					case RECURRENCE_FREQUENCY.CUSTOM:
						setSelected(find(recurrenceItems, { value: ev }) ?? recurrenceItems[0]);
						break;
					case RECURRENCE_FREQUENCY.DAILY:
					case RECURRENCE_FREQUENCY.MONTHLY:
					case RECURRENCE_FREQUENCY.YEARLY:
						setSelected(find(recurrenceItems, { value: ev }) ?? recurrenceItems[0]);
						dispatch(
							editEditorRecurrence({
								id: editorId,
								recur: [
									{
										add: [{ rule: [defaultValue] }]
									}
								]
							})
						);
						break;
					case RECURRENCE_FREQUENCY.WEEKLY:
						setSelected(find(recurrenceItems, { value: ev }) ?? recurrenceItems[0]);
						dispatch(
							editEditorRecurrence({
								id: editorId,
								recur: [
									{
										add: [
											{
												rule: [
													{
														...defaultValue,
														byday: {
															wkday: [
																{ day: toUpper(`${moment(start).format('dddd').slice(0, 2)}`) }
															]
														}
													}
												]
											}
										]
									}
								]
							})
						);
						break;
					default:
						setSelected(
							find(recurrenceItems, { value: RECURRENCE_FREQUENCY.NEVER }) ?? recurrenceItems[0]
						);
						dispatch(editEditorRecurrence({ id: editorId, recur: undefined }));
				}
			}
		},
		[recurrenceItems, dispatch, editorId, start]
	);

	return initialValue ? (
		<Select
			label={t('label.repeat', 'Repeat')}
			onChange={onChange}
			items={recurrenceItems}
			selection={selected}
			disablePortal
			disabled={disabled?.recurrence}
			LabelFactory={LabelFactory}
		/>
	) : null;
};

export default EditorRecurrence;
