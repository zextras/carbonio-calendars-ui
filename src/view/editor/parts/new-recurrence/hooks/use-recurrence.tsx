/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { toUpper } from 'lodash';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectEditorStart } from '../../../../../store/selectors/editor';
import { EditorCallbacks } from '../../../../../types/editor';
import { CustomRepeatSelectItem, RepeatItemComponent } from '../components';


type UseRecurrenceReturn = {
	onChange: (arg: string) => void;
	recurrenceItems: Array<{
		label: string;
		value: string;
		customComponent: JSX.Element;
	}>;
};

const useRecurrence = (editorId: string, callbacks: EditorCallbacks): UseRecurrenceReturn => {
	const [t] = useTranslation();
	const start = useSelector(selectEditorStart(editorId));
	const { onRecurrenceChange } = callbacks;

	const recurrenceItems = useMemo(
		() => [
			{
				label: t('label.none', 'None'),
				value: 'NONE',
				customComponent: <RepeatItemComponent label={t('label.none', 'None')} />
			},
			{
				label: t('label.every_day', 'Every day'),
				value: 'DAI',
				customComponent: <RepeatItemComponent label={t('label.every_day', 'Every day')} />
			},
			{
				label: t('repeat.everyWeek', 'Every Week'),
				value: 'WEE',
				customComponent: <RepeatItemComponent label={t('repeat.everyWeek', 'Every Week')} />
			},
			{
				label: t('repeat.everyMonth', 'Every Month'),
				value: 'MON',
				customComponent: <RepeatItemComponent label={t('repeat.everyMonth', 'Every Month')} />
			},
			{
				label: t('repeat.everyYear', 'Every Year'),
				value: 'YEA',
				customComponent: <RepeatItemComponent label={t('repeat.everyYear', 'Every Year')} />
			},
			{
				label: t('label.custom', 'Custom'),
				value: 'CUSTOM',
				customComponent: <CustomRepeatSelectItem editorId={editorId} callbacks={callbacks} />
			}
		],
		[callbacks, editorId, t]
	);

	const onChange = useCallback(
		(ev) => {
			const defaultValue = { freq: ev, interval: [{ ival: 1 }] };
			switch (ev) {
				case 'CUSTOM':
					break;
				case 'DAI':
				case 'MON':
				case 'YEA':
					onRecurrenceChange([
						{
							add: [{ rule: [defaultValue] }]
						}
					]);
					break;
				case 'WEE':
					onRecurrenceChange([
						{
							add: [
								{
									rule: [
										{
											...defaultValue,
											byday: {
												wkday: [{ day: toUpper(`${moment(start).format('dddd').slice(0, 2)}`) }]
											}
										}
									]
								}
							]
						}
					]);
					break;
				default:
					onRecurrenceChange(undefined);
			}
		},
		[onRecurrenceChange, start]
	);
	return { onChange, recurrenceItems };
};

export default useRecurrence;
