/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import {
	Row,
	Select,
	Text,
	Padding,
	Icon,
	Container,
	SingleSelectionOnChange
} from '@zextras/carbonio-design-system';
import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';
import { TFunction } from 'i18next';

import { ColorContainer, Square, TextUpperCase } from './styled-components';

type LabelFactoryProps = {
	selected: Array<{ label: string; value: string }>;
	open: boolean;
	focus: boolean;
	label?: string;
};

const LabelFactory = ({ selected, label, open, focus }: LabelFactoryProps): React.JSX.Element => (
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
				<TextUpperCase>{selected[0].label}</TextUpperCase>
			</Row>
			<Padding right="small">
				<Square $color={ZIMBRA_STANDARD_COLORS[Number(selected[0].value)].hex} />
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

const getStatusItems = (
	t: TFunction
): { label: string; value: string; customComponent: React.JSX.Element }[] =>
	ZIMBRA_STANDARD_COLORS.map((el, index) => {
		const tagColorLabel = t(`colors.${el.zLabel}`, el.zLabel);
		return {
			label: tagColorLabel,
			value: index.toString(),
			customComponent: (
				<Container width="100%" mainAlignment="space-between" orientation="horizontal" height="fit">
					<Padding left="small">
						<TextUpperCase>{tagColorLabel}</TextUpperCase>
					</Padding>
					<Square $color={el.hex} />
				</Container>
			)
		};
	});

type ColorPickerProps = {
	t: TFunction;
	onChange: SingleSelectionOnChange;
	defaultColor?: number;
	label?: string;
};
export const ColorPicker = ({
	t,
	onChange,
	defaultColor = 0,
	label
}: ColorPickerProps): React.JSX.Element => {
	const colors = useMemo(() => getStatusItems(t), [t]);
	const defaultSelection = useMemo(() => colors[defaultColor], [colors, defaultColor]);
	return (
		<Select
			label={label}
			onChange={onChange}
			items={colors}
			defaultSelection={defaultSelection}
			LabelFactory={LabelFactory}
		/>
	);
};
