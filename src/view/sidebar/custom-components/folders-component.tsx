/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	AccordionItem,
	AccordionItemType,
	Avatar,
	Dropdown,
	Icon,
	Padding,
	Row,
	Tooltip
} from '@zextras/carbonio-design-system';
import { FOLDERS, ROOT_NAME, t, useUserAccount } from '@zextras/carbonio-shell-ui';
import React, { FC, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import {
	getFolderIcon,
	getFolderTranslatedName,
	recursiveToggleCheck
} from '../../../commons/utilities';
import { useCalendarActions } from '../../../hooks/use-calendar-actions';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';

type FoldersComponentProps = {
	item: Folder;
};

const FittedRow = styled(Row)`
	max-width: calc(100% - (2 * ${({ theme }): string => theme.sizes.padding.small}));
	height: 3rem;
`;

export const FoldersComponent: FC<FoldersComponentProps> = ({ item }) => {
	const { checked } = item;
	const { displayName } = useUserAccount();
	const isRootAccount = useMemo(
		() => item.id === FOLDERS.USER_ROOT || (item.isLink && item.oname === ROOT_NAME),
		[item]
	);

	const accordionItem = useMemo(
		() =>
			({
				...item,
				label:
					item.id === FOLDERS.USER_ROOT
						? displayName
						: getFolderTranslatedName({ folderId: item.id, folderName: item.name }) ?? '',
				icon: getFolderIcon({ item, checked: !!checked }),
				iconColor: setCalendarColor({ color: item.color, rgb: item.rgb }).color,
				textProps: { size: 'small' }
			} as AccordionItemType),
		[item, displayName, checked]
	);

	const ddItems = useCalendarActions(item);

	const onClick = useCallback(
		(): void =>
			recursiveToggleCheck({
				folder: item,
				checked: !!checked
			}),
		[checked, item]
	);

	const SharedStatusIcon = useMemo(() => {
		if (!item.acl?.grant || !item.acl?.grant?.length) {
			return '';
		}

		const tooltipText = t('tooltip.calendar_sharing_status', {
			count: item.acl.grant.length,
			defaultValue_one: 'Shared with 1 person',
			defaultValue: 'Shared with {{count}} people'
		});

		return (
			<Padding left="small">
				<Tooltip placement="right" label={tooltipText}>
					<Row>
						<Icon icon="ArrowCircleRight" customColor="#ffb74d" size="medium" />
					</Row>
				</Tooltip>
			</Padding>
		);
	}, [item]);

	// hide folders where a share was provided and subsequently removed
	if (item.isLink && item.broken) {
		return <></>;
	}

	return isRootAccount ? (
		<FittedRow>
			<Padding left="small">
				<Avatar
					label={accordionItem.label ?? ''}
					colorLabel={accordionItem.iconColor}
					size="medium"
				/>
			</Padding>
			<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
				<AccordionItem item={accordionItem} />
			</Tooltip>
		</FittedRow>
	) : (
		<Dropdown items={ddItems} contextMenu width="100%" display="block">
			<Row onClick={onClick}>
				<Padding left="small" />
				<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
					<AccordionItem item={accordionItem} />
				</Tooltip>
				{SharedStatusIcon}
			</Row>
		</Dropdown>
	);
};
