/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import styled from '@emotion/styled';
import {
	AnyColor,
	Container,
	Icon,
	Padding,
	Row,
	Select,
	SelectProps,
	Text
} from '@zextras/carbonio-design-system';

import { CALENDARS_STANDARD_COLORS } from '../../constants/calendar';

const ColorContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
`;
const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;
const Square = styled.div<{ $color?: AnyColor }>`
	width: 1.125rem;
	height: 1.125rem;
	position: relative;
	top: -0.1875rem;
	border: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	background: ${({ $color }): string | undefined => $color};
	border-radius: 0.25rem;
`;

const LabelFactory: SelectProps['LabelFactory'] = ({
	selected,
	label,
	open,
	focus
}): ReactElement => (
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
				<TextUpperCase>{selected?.[0].label}</TextUpperCase>
			</Row>
			<Padding right="small">
				<Square $color={CALENDARS_STANDARD_COLORS[Number(selected[0].value)].color} />
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

export const SelectColor = ({
	colors,
	setColor
}: {
	colors: any;
	setColor: (color: number) => void;
}): React.JSX.Element => (
	<Select
		label={'Select color'}
		onChange={(value): void => {
			if (value) {
				setColor(parseInt(value, 10));
			}
		}}
		items={colors}
		defaultSelection={colors[0]}
		LabelFactory={LabelFactory}
	/>
);
