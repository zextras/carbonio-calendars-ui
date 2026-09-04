/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import styled from '@emotion/styled';
import {
	Container,
	Padding,
	Text,
	Row,
	Icon,
	SelectItem,
	LabelFactoryProps
} from '@zextras/carbonio-design-system';
import { Folder } from '@zextras/carbonio-ui-commons';

import { getFolderIcon } from '../../../commons/utilities';

export const ColorContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
`;

export const TextUpperCase = styled(Text)`
	text-transform: capitalize;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: ${({ theme, disabled, color }): string =>
		(disabled && theme.palette.text.disabled) || color || theme.palette.text.regular};
`;

export const LabelText = styled(Text)<{ $showPrimary?: boolean }>`
	color: ${({ theme, disabled, $showPrimary }): string =>
		(disabled && theme.palette.text.disabled) ||
		($showPrimary && theme.palette.primary.regular) ||
		theme.palette.secondary.regular};
`;

interface CustomSelectItem extends SelectItem {
	id?: string;
	folder?: Folder;
	color?: string;
	ownerEmail?: string;
}

interface CustomLabelFactoryProps extends LabelFactoryProps {
	selected: CustomSelectItem[];
}

export const ItemFactory = ({
	color,
	label,
	folder,
	disabled,
	ownerEmail
}: {
	color: string | undefined;
	label: string;
	folder?: Folder;
	disabled: boolean;
	ownerEmail?: string;
}): JSX.Element => {
	const referenceIcon = useMemo(
		() => (folder ? getFolderIcon({ item: folder, checked: true }) : ''),
		[folder]
	);
	return (
		<Row wrap={'nowrap'}>
			<Padding right="small">
				<Icon
					icon={referenceIcon || 'Calendar2'}
					color={color}
					disabled={disabled}
					style={{ width: '1.125rem', height: '1.125rem' }}
				/>
			</Padding>
			<TextUpperCase disabled={disabled}>{label}</TextUpperCase>
			<Row takeAvailableSpace>
				{ownerEmail && (
					<Padding left="small" style={{ overflow: 'hidden' }}>
						<TextUpperCase size="extrasmall" color={'gray1'}>{`(${ownerEmail})`}</TextUpperCase>
					</Padding>
				)}
			</Row>
		</Row>
	);
};

const LabelFactory = (item: CustomLabelFactoryProps): ReactElement => {
	const { selected, label, open, focus, disabled } = item;
	return (
		<ColorContainer
			orientation="horizontal"
			width="fill"
			crossAlignment="center"
			mainAlignment="space-between"
			borderRadius="half"
			padding={{
				all: 'small'
			}}
			background={'gray5'}
			style={{ cursor: disabled ? 'no-drop' : 'pointer' }}
		>
			<Row width="100%" takeAvailableSpace mainAlignment="space-between">
				<Row
					orientation="vertical"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					padding={{ left: 'small' }}
				>
					<LabelText size="small" disabled={disabled} $showPrimary={open || focus}>
						{label}
					</LabelText>
					{selected?.[0] && (
						<ItemFactory
							label={selected[0].label}
							color={selected[0].color}
							folder={selected[0].folder}
							ownerEmail={selected[0].ownerEmail}
							disabled={disabled}
						/>
					)}
				</Row>
			</Row>
			<Icon
				size="large"
				icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
				disabled={disabled}
				style={{ alignSelf: 'center' }}
				color={(disabled && 'text') || ((open || focus) && 'primary') || 'secondary'}
			/>
		</ColorContainer>
	);
};
export default LabelFactory;
