/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Select, Icon, Row, Text, Button } from '@zextras/carbonio-design-system';
import { getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { toUpper, find } from 'lodash';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
	selectEditorRecurrence,
	selectEditorStart,
	selectIsException,
	selectIsInstance,
	selectIsSeries
} from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import CustomRecurrenceModal from './recurrences/custom-recurrence-modal';

export const ColorContainer = styled(Container)`
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray2.regular};
`;

export const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;

type LabelFactoryProps = {
	selected: [{ label: string; value: string }];
	label: string;
	open: boolean;
	focus: boolean;
};

const CustomRepeat = ({ setOpen }: { setOpen: (a: boolean) => void }): ReactElement => (
	<Container width="fill" mainAlignment="center" orientation="horizontal">
		<Button
			type="outlined"
			label={getBridgedFunctions().t('label.custom', 'Custom')}
			color="primary"
			size="fill"
			onClick={(): void => {
				setOpen(true);
			}}
		/>
	</Container>
);

const LabelFactory = ({ selected, label, open, focus }: LabelFactoryProps): ReactElement => (
	<ColorContainer
		orientation="horizontal"
		width="fill"
		crossAlignment="center"
		mainAlignment="space-between"
		borderRadius="half"
		background="gray5"
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

const RepeatItemComponent = ({ label }: { label: string }): ReactElement => (
	<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
		<TextUpperCase>{label}</TextUpperCase>
	</Container>
);

type SelectProps =
	| {
			label: string;
			value: string;
			customComponent: ReactElement;
	  }
	| undefined;

export const EditorRecurrence = ({ editorId, callbacks }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const { onRecurrenceChange } = callbacks;
	const recur = useSelector(selectEditorRecurrence(editorId));
	const start = useSelector(selectEditorStart(editorId));
	const [value, setValue] = useState<SelectProps>(undefined);
	const [open, setOpen] = useState(false);

	const isInstance = useSelector(selectIsInstance(editorId));
	const isSeries = useSelector(selectIsSeries(editorId));
	const isException = useSelector(selectIsException(editorId));

	const onChange = useCallback(
		(ev) => {
			const defaultValue = { freq: ev, interval: { ival: 1 } };
			switch (ev) {
				case 'CUSTOM':
					setOpen(true);
					break;
				case 'DAI':
				case 'MON':
				case 'YEA':
					onRecurrenceChange({
						add: { rule: defaultValue }
					});
					break;
				case 'WEE':
					onRecurrenceChange({
						add: {
							rule: {
								...defaultValue,
								byday: {
									wkday: [{ day: toUpper(`${moment(start).format('dddd').slice(0, 2)}`) }]
								}
							}
						}
					});
					break;
				default:
					onRecurrenceChange(null);
			}
		},
		[onRecurrenceChange, start]
	);

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
				customComponent: <CustomRepeat setOpen={setOpen} />
			}
		],
		[t]
	);
	const ruleKey = useMemo(() => recur?.add?.[0]?.rule?.[0]?.freq ?? 'NONE', [recur?.add]);

	useEffect(() => {
		if (ruleKey) {
			setValue(recur ? find(recurrenceItems, { value: ruleKey }) : recurrenceItems[0]);
		}
	}, [recur, recurrenceItems, ruleKey]);

	const disabled = useMemo(
		() => isSeries && isInstance && !isException,
		[isException, isInstance, isSeries]
	);

	return value ? (
		<>
			<Select
				label={t('label.repeat', 'Repeat')}
				onChange={onChange}
				items={recurrenceItems}
				selection={value}
				disablePortal
				disabled={disabled}
				LabelFactory={LabelFactory}
			/>
			<CustomRecurrenceModal
				openModal={open}
				setOpenCb={setOpen}
				onRecurrenceChange={onRecurrenceChange}
			/>
		</>
	) : null;
};
