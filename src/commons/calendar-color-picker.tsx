/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import styled from '@emotion/styled';
import {
	Icon,
	Padding,
	Row,
	SelectItem,
	SelectProps,
	Text,
	Container
} from '@zextras/carbonio-design-system';

import { ColorContainer, Square, TextUpperCase } from './styled-components';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';

const ColorSquare = styled(Square)`
	margin-top: 0.5rem;
`;

export const CalendarColorLabelFactory: SelectProps['LabelFactory'] = ({
	selected,
	label,
	open,
	focus
}) => {
	const selectedIndex = Number(selected?.[0]?.value ?? 0);
	const selectedColor =
		CALENDARS_STANDARD_COLORS[selectedIndex]?.color ?? CALENDARS_STANDARD_COLORS[0].color;

	return (
		<ColorContainer
			orientation="horizontal"
			width="fill"
			crossAlignment="center"
			mainAlignment="space-between"
			borderRadius="half"
			background={'gray5'}
			padding={{ all: 'small' }}
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
					<TextUpperCase>{selected?.[0]?.label}</TextUpperCase>
				</Row>
				<Padding right="small">
					<ColorSquare $color={selectedColor} />
				</Padding>
			</Row>
			<Icon
				size="large"
				icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
				color={open || focus ? 'primary' : 'secondary'}
				style={{ alignSelf: 'center' }}
			/>
		</ColorContainer>
	);
};

export const buildCalendarColorItems = (
	getLabel: (colorLabel: string) => string = (colorLabel): string => colorLabel
): SelectItem[] =>
	CALENDARS_STANDARD_COLORS.map((color, index) => {
		const label = getLabel(color.label ?? '');
		return {
			background: color.background,
			label,
			value: index.toString(),
			customComponent: (
				<Container width="100%" mainAlignment="space-between" orientation="horizontal" height="fit">
					<Padding left="small">
						<TextUpperCase>{label}</TextUpperCase>
					</Padding>
					<Padding right="small">
						<ColorSquare $color={color.color} />
					</Padding>
				</Container>
			)
		};
	});
