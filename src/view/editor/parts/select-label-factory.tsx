/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import {
	Container,
	Padding,
	Text,
	Row,
	Icon,
	TextProps,
	IconProps,
	SelectItem,
	LabelFactoryProps,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useRoot } from '../../../carbonio-ui-commons/store/zustand/folder';
import { FOLDERS } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { Grant } from '../../../carbonio-ui-commons/types/folder';
import { isLinkChild } from '../../../commons/utilities';

export const Square = styled.div`
	width: 1rem;
	height: 1rem;
	background: ${({ color }): string | undefined => color};
	border-radius: 0.25rem;
	opacity: ${({ disabled }: { disabled?: boolean }): number => (disabled ? 0.5 : 1)};
`;

export const ColorContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
`;

export const TextUpperCase = styled(Text)`
	text-transform: capitalize;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: ${({ theme, disabled, color }): string => {
		if (color) {
			return disabled ? theme.palette.text.disabled : color;
		}
		return disabled ? theme.palette.text.disabled : theme.palette.text.regular;
	}};
`;

export const LabelText = styled(Text)<TextProps & { $showPrimary?: boolean }>`
color: ${({ theme, disabled, $showPrimary }): string =>
	// eslint-disable-next-line no-nested-ternary
	disabled
		? theme.palette.text.disabled
		: $showPrimary
			? theme.palette.primary.regular
			: theme.palette.secondary.regular}};`;

export const StyledIcon = styled(Icon)<IconProps & { $showPrimary?: boolean }>`
color: ${({ theme, disabled, $showPrimary }): string =>
	// eslint-disable-next-line no-nested-ternary
	disabled
		? theme.palette.text.disabled
		: $showPrimary
			? theme.palette.primary.regular
			: theme.palette.secondary.regular}};`;

interface CustomSelectItem extends SelectItem {
	id?: string;
	acl?: { grant: Array<Grant> };
	isLink?: boolean;
	absFolderPath?: string | undefined;
	color?: string;
}

interface CustomLabelFactoryProps extends LabelFactoryProps {
	selected: CustomSelectItem[];
}

const RowWithIcon = ({
	icon,
	color,
	tooltipText
}: {
	icon: string;
	color: string;
	tooltipText: string;
}): JSX.Element => (
	<Padding left="small">
		<Tooltip placement="right" label={tooltipText}>
			<Row>
				<Icon icon={icon} color={color} size="medium" />
			</Row>
		</Tooltip>
	</Padding>
);

export const ItemFactory = ({
	id,
	color,
	label,
	acl,
	isLink,
	absFolderPath,
	disabled
}: {
	id: string | undefined;
	color: string | undefined;
	label: string;
	acl?: { grant: Array<Grant> };
	isLink?: boolean;
	absFolderPath?: string | undefined;
	disabled: boolean;
}): JSX.Element => {
	const [t] = useTranslation();
	const root = useRoot(id ?? '');
	const sharedStatusIcon = useMemo(() => {
		if (isLink || isLinkChild({ absFolderPath })) {
			const tooltipText = t('tooltip.folder_linked_status', 'Linked to me');
			return <RowWithIcon icon={'Linked'} color={'linked'} tooltipText={tooltipText} />;
		}
		if (acl?.grant) {
			const tooltipText = t('tooltip.calendar_sharing_status', {
				count: acl?.grant?.length,
				defaultValue_one: 'Shared with 1 person',
				defaultValue_other: 'Shared with {{count}} people'
			});
			return <RowWithIcon icon={'Shared'} color={'shared'} tooltipText={tooltipText} />;
		}
		return null;
	}, [absFolderPath, acl?.grant, isLink, t]);
	return (
		<Row wrap={'nowrap'}>
			<Padding right="small">
				<Square color={color} disabled={disabled} />
			</Padding>
			<TextUpperCase disabled={disabled}>{label}</TextUpperCase>
			{sharedStatusIcon}
			<Row takeAvailableSpace>
				{root && root.id !== FOLDERS.USER_ROOT && (
					<Padding left="small" style={{ overflow: 'hidden' }}>
						<TextUpperCase color={'gray1'}>{`(${root.name})`}</TextUpperCase>
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
							isLink={selected[0].isLink}
							absFolderPath={selected[0].absFolderPath}
							acl={selected[0].acl}
							id={selected[0].id}
							disabled={disabled}
						/>
					)}
				</Row>
			</Row>
			<StyledIcon
				size="large"
				icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
				disabled={disabled}
				$showPrimary={open || focus}
				style={{ alignSelf: 'center' }}
			/>
		</ColorContainer>
	);
};
export default LabelFactory;
