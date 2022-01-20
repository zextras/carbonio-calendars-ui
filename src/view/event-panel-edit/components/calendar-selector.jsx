/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Select, Text, Row, Icon } from '@zextras/carbonio-design-system';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { filter, find, map } from 'lodash';
import styled from 'styled-components';
import { selectCalendars } from '../../../store/selectors/calendars';

export const Square = styled.div`
	width: 16px;
	height: 16px;
	background: ${({ color }) => color};
	border-radius: 4px;
`;
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
					<Padding right="small">
						<Square color={selected[0].color} />
					</Padding>
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

export default function CalendarSelector({
	calendarId,
	onCalendarChange,
	label,
	excludeTrash = false,
	updateAppTime = false
}) {
	const [t] = useTranslation();

	const calendars = useSelector(selectCalendars);

	const requiredCalendars = useMemo(
		() => (excludeTrash ? filter(calendars, (cal) => cal.zid !== '3') : calendars),
		[calendars, excludeTrash]
	);
	const calendarItems = useMemo(
		() =>
			map(requiredCalendars, (cal) => ({
				label: cal.name,
				value: cal.id,
				color: cal.color.color || 0,
				customComponent: (
					<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
						<Square color={cal.color.color || 'gray6'} />
						<Padding left="small">
							<Text>{cal.name}</Text>
						</Padding>
					</Container>
				)
			})),
		[requiredCalendars]
	);
	const defaultCalendarSelection = useMemo(
		() => find(calendarItems, ['value', calendarId]) || calendars[0],
		[calendarItems, calendars, calendarId]
	);

	const onSelectedCalendarChange = useCallback(
		(id) => onCalendarChange(calendars[id]),
		[calendars, onCalendarChange]
	);

	return (
		<Select
			label={label || t('label.calendar', 'Calendar')}
			onChange={onSelectedCalendarChange}
			items={calendarItems}
			defaultSelection={defaultCalendarSelection}
			disablePortal
			disabled={updateAppTime}
			LabelFactory={LabelFactory}
		/>
	);
}
