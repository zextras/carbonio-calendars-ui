/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Select, Text, Icon, Row } from '@zextras/carbonio-design-system';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { find } from 'lodash';

export const Square = styled.div`
	width: 16px;
	height: 16px;
	background: ${({ color, disabled, theme }) =>
		disabled ? theme.palette.secondary.disabled : color};
	border-radius: 4px;
`;

export const ColorContainer = styled(Container)`
	border-bottom: 1px solid ${({ theme }) => theme.palette.gray2.regular};
`;

export const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;

const LabelFactory = ({ selected, label, open, focus, disabled }) => (
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
		style={{ cursor: disabled ? 'no-drop' : 'pointer' }}
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
					<Padding right="small">
						<Square color={selected[0].color} disabled={disabled} />
					</Padding>
					<TextUpperCase color={disabled ? 'secondary' : 'text'}>{selected[0].label}</TextUpperCase>
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

const StatusItemComponent = ({ label, color }) => (
	<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
		<Square color={color} />
		<Padding left="small">
			<Text>{label}</Text>
		</Padding>
	</Container>
);

const STATUS_VALUES = {
	FREE: 'F',
	TENTATIVE: 'T',
	BUSY: 'B',
	OUT_OF_OFFICE: 'O'
};

const getStatusItems = (t) => [
	{
		label: t('label.free', 'Free'),
		value: STATUS_VALUES.FREE,
		color: '#ffffff',
		customComponent: <StatusItemComponent label={t('label.free', 'Free')} color="#ffffff" />
	},
	{
		label: t('label.tentative', 'tentative'),
		value: STATUS_VALUES.TENTATIVE,
		color: '#ffc107',
		customComponent: (
			<StatusItemComponent label={t('label.tentative', 'tentative')} color="#ffc107" />
		)
	},
	{
		label: t('label.busy', 'Busy'),
		value: STATUS_VALUES.BUSY,
		color: '#d5e3f6',
		customComponent: <StatusItemComponent label={t('label.busy', 'Busy')} color="#d5e3f6" />
	},
	{
		label: t('label.out_of_office', 'Out of office'),
		value: STATUS_VALUES.OUT_OF_OFFICE,
		color: '#d5e3f6',
		customComponent: (
			<StatusItemComponent label={t('label.out_of_office', 'Out of office')} color="#2b73d2" />
		)
	}
];

export default function FreeBusySelector({ onDisplayStatusChange, data, disabled }) {
	const [t] = useTranslation();
	const [isSelectedByUser, setIsSelectedByUser] = useState(false);
	const setValue = useCallback(() => setIsSelectedByUser(true), []);
	const statusItems = useMemo(() => getStatusItems(t), [t]);
	const selectedItem = useMemo(
		() =>
			find(statusItems, (item) => {
				if (!isSelectedByUser) {
					return data.allDay
						? item.value === STATUS_VALUES.FREE
						: item.value === STATUS_VALUES.BUSY;
				}
				return item.value === data.resource.freeBusy;
			}),
		[statusItems, data.allDay, data.resource.freeBusy, isSelectedByUser]
	);
	const onChange = useCallback(
		(e) => {
			onDisplayStatusChange(e);
		},
		[onDisplayStatusChange]
	);

	return (
		<Select
			disabled={disabled}
			label={t('label.display', 'Display')}
			onChange={onChange}
			items={statusItems}
			selection={selectedItem ?? statusItems[2]}
			disablePortal
			LabelFactory={LabelFactory}
			onClick={setValue}
		/>
	);
}
