/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select, Icon, Row, Container, Text } from '@zextras/zapp-ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { find } from 'lodash';
import styled from 'styled-components';

const getReminderItems = (t) => [
	{ label: t('reminder.never', 'Never'), value: 'never' },
	{ label: t('reminder.at_time_of_event', 'At the time of the event'), value: '0' },
	{
		label: t('reminder.minute_before', {
			count: 1,
			defaultValue: '{{count}} minute before',
			defaultValue_plural: '{{count}} minutes before'
		}),
		value: '1'
	},
	{
		label: t('reminder.minute_before', {
			count: 5,
			defaultValue: '{{count}} minute before',
			defaultValue_plural: '{{count}} minutes before'
		}),
		value: '5'
	},
	{
		label: t('reminder.minute_before', {
			count: 10,
			defaultValue: '{{count}} minute before',
			defaultValue_plural: '{{count}} minutes before'
		}),
		value: '10'
	},
	{
		label: t('reminder.minute_before', {
			count: 15,
			defaultValue: '{{count}} minute before',
			defaultValue_plural: '{{count}} minutes before'
		}),
		value: '15'
	},
	{
		label: t('reminder.minute_before', {
			count: 30,
			defaultValue: '{{count}} minute before',
			defaultValue_plural: '{{count}} minutes before'
		}),
		value: '30'
	},
	{
		label: t('reminder.minute_before', {
			count: 45,
			defaultValue: '{{count}} minute before',
			defaultValue_plural: '{{count}} minutes before'
		}),
		value: '45'
	},
	{
		label: t('reminder.hour_before', {
			count: 1,
			defaultValue: '{{count}} hour before',
			defaultValue_plural: '{{count}} hours before'
		}),
		value: '60'
	},
	{
		label: t('reminder.hour_before', {
			count: 2,
			defaultValue: '{{count}} hour before',
			defaultValue_plural: '{{count}} hours before'
		}),
		value: '120'
	},
	{
		label: t('reminder.hour_before', {
			count: 4,
			defaultValue: '{{count}} hour before',
			defaultValue_plural: '{{count}} hours before'
		}),
		value: '240'
	},
	{
		label: t('reminder.hour_before', {
			count: 5,
			defaultValue: '{{count}} hour before',
			defaultValue_plural: '{{count}} hours before'
		}),
		value: '300'
	},
	{
		label: t('reminder.hour_before', {
			count: 18,
			defaultValue: '{{count}} hour before',
			defaultValue_plural: '{{count}} hours before'
		}),
		value: (18 * 60).toString()
	},
	{
		label: t('reminder.day_before', {
			count: 1,
			defaultValue: '{{count}} day before',
			defaultValue_plural: '{{count}} days before'
		}),
		value: (24 * 60).toString()
	},
	{
		label: t('reminder.day_before', {
			count: 2,
			defaultValue: '{{count}} day before',
			defaultValue_plural: '{{count}} days before'
		}),
		value: (48 * 60).toString()
	},
	{
		label: t('reminder.day_before', {
			count: 3,
			defaultValue: '{{count}} day before',
			defaultValue_plural: '{{count}} days before'
		}),
		value: (72 * 60).toString()
	},
	{
		label: t('reminder.day_before', {
			count: 4,
			defaultValue: '{{count}} day before',
			defaultValue_plural: '{{count}} days before'
		}),
		value: (4 * 24 * 60).toString()
	},
	{
		label: t('reminder.week_before', {
			count: 1,
			defaultValue: '{{count}} week before',
			defaultValue_plural: '{{count}} weeks before'
		}),
		value: (7 * 24 * 60).toString()
	},
	{
		label: t('reminder.week_before', {
			count: 2,
			defaultValue: '{{count}} week before',
			defaultValue_plural: '{{count}} weeks before'
		}),
		value: (2 * 7 * 24 * 60).toString()
	}
];

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

export default function ReminderSelector({ onReminderChange, data, disabled }) {
	const [t] = useTranslation();
	const reminderItems = useMemo(() => getReminderItems(t), [t]);
	const selectedItem = useMemo(
		() => find(reminderItems, (item) => item.value === data.resource.alarmValue),
		[reminderItems, data.resource.alarmValue]
	);
	return (
		<Select
			disabled={disabled}
			label={t('label.reminder', 'Reminder')}
			maxDropdownHeight="200px"
			onChange={onReminderChange}
			items={reminderItems}
			defaultSelection={selectedItem ?? reminderItems[3]}
			disablePortal
			LabelFactory={LabelFactory}
		/>
	);
}
