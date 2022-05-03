/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, Select, Icon, Row, Text } from '@zextras/carbonio-design-system';
import React, { useCallback, useMemo, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { toUpper } from 'lodash';
import styled from 'styled-components';
import CustomRecurrenceModal from './recurrences/custom-recurrence-modal';

const CustomRepeat = ({ setOpen, t }) => (
	<Container width="fill" mainAlignment="center" orientation="horizontal">
		<Button
			type="outlined"
			label={t('label.custom', 'Custom')}
			color="primary"
			size="fill"
			onClick={() => {
				setOpen(true);
			}}
		/>
	</Container>
);

export const ColorContainer = styled(Container)`
	border-bottom: 1px solid ${({ theme }) => theme.palette.gray2.regular};
`;

export const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;

const LabelFactory = ({ selected, label, open, focus }) => (
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

const RepeatItemComponent = ({ label }) => (
	<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
		<TextUpperCase>{label}</TextUpperCase>
	</Container>
);
export default function RecurrenceSelector({ data, callbacks, updateAppTime = false, disabled }) {
	const [t] = useTranslation();
	const [open, setOpen] = useState(false);

	const onRecurrenceChange = useCallback(
		(ev) => {
			const defaultValue = { freq: ev, interval: { ival: 1 } };
			switch (ev) {
				case 'CUSTOM':
					setOpen(true);
					break;
				case 'DAI':
				case 'MON':
				case 'YEA':
					callbacks.onRecurrenceChange({
						add: { rule: defaultValue }
					});
					break;
				case 'WEE':
					callbacks.onRecurrenceChange({
						add: {
							rule: {
								...defaultValue,
								byday: {
									wkday: [{ day: toUpper(`${moment(data.start).format('dddd').slice(0, 2)}`) }]
								}
							}
						}
					});
					break;
				default:
					callbacks.onRecurrenceChange(null);
			}
		},
		[callbacks, data.start]
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
				customComponent: <CustomRepeat setOpen={setOpen} t={t} />
			}
		],
		[t]
	);

	return (
		<>
			<Select
				label={t('label.repeat', 'Repeat')}
				onChange={onRecurrenceChange}
				items={recurrenceItems}
				defaultSelection={recurrenceItems[0]}
				disablePortal
				disabled={updateAppTime || disabled}
				LabelFactory={LabelFactory}
			/>
			<CustomRecurrenceModal
				openModal={open}
				setOpenCb={setOpen}
				data={data}
				callbacks={callbacks}
			/>
		</>
	);
}
