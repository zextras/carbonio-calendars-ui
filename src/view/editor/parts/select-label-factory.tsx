/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Container, Padding, Text, Row, Icon } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

export const Square = styled.div`
	width: 16px;
	height: 16px;
	background: ${({ color }): string | undefined => color};
	border-radius: 4px;
	opacity: ${({ disabled }: { disabled?: boolean }): number => (disabled ? 0.5 : 1)};
`;

export const ColorContainer = styled(Container)`
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray2.regular};
`;

export const TextUpperCase = styled(Text)`
	text-transform: capitalize;
	color: ${({ theme, disabled }): string =>
		disabled ? theme.palette.text.disabled : theme.palette.text.regular}}
`;

export const LabelText = styled(Text)`
color: ${({ theme, disabled, showPrimary }): string =>
	// eslint-disable-next-line no-nested-ternary
	disabled
		? theme.palette.text.disabled
		: showPrimary
		? theme.palette.primary.regular
		: theme.palette.secondary.regular}}`;

export const StyledIcon = styled(Icon)`
color: ${({ theme, disabled, showPrimary }): string =>
	// eslint-disable-next-line no-nested-ternary
	disabled
		? theme.palette.text.disabled
		: showPrimary
		? theme.palette.primary.regular
		: theme.palette.secondary.regular}}`;

type LabelFactoryProps = {
	selected: [{ label: string; value: string; color: string }];
	label: string;
	open: boolean;
	focus: boolean;
	disabled: boolean;
};
const LabelFactory = ({
	selected,
	label,
	open,
	focus,
	disabled
}: LabelFactoryProps): JSX.Element => (
	<ColorContainer
		orientation="horizontal"
		width="fill"
		crossAlignment="center"
		mainAlignment="space-between"
		borderRadius="half"
		padding={{
			all: 'small'
		}}
		background="gray5"
		disabled={disabled}
		style={{ cursor: disabled ? 'no-drop' : 'pointer' }}
	>
		<Row width="100%" takeAvailableSpace mainAlignment="space-between">
			<Row
				orientation="vertical"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				padding={{ left: 'small' }}
			>
				<Text size="small" disabled={disabled} showPrimary={open || focus}>
					{label}
				</Text>
				<Row>
					<Padding right="small">
						<Square color={selected[0].color} disabled={disabled} />
					</Padding>
					<TextUpperCase disabled={disabled}>{selected[0].label}</TextUpperCase>
				</Row>
			</Row>
		</Row>
		<StyledIcon
			size="large"
			icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
			disabled={disabled}
			showPrimary={open || focus}
			style={{ alignSelf: 'center' }}
		/>
	</ColorContainer>
);
export default LabelFactory;
