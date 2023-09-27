/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

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
import { FOLDERS, t, useUserAccount } from '@zextras/carbonio-shell-ui';
import styled from 'styled-components';

import { isRoot } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import {
	getFolderIcon,
	getFolderTranslatedName,
	recursiveToggleCheck
} from '../../../commons/utilities';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar';
import { useCalendarActions } from '../../../hooks/use-calendar-actions';
import { useCheckedCalendarsQuery } from '../../../hooks/use-checked-calendars-query';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { useAppDispatch } from '../../../store/redux/hooks';
import { useRangeEnd, useRangeStart } from '../../../store/zustand/hooks';

type FoldersComponentProps = {
	item: Folder;
};

const FittedRow = styled(Row)`
	max-width: calc(100% - (2 * ${({ theme }): string => theme.sizes.padding.small}));
	height: 3rem;
`;

const ContextMenuItem = ({
	children,
	item
}: {
	children: JSX.Element;
	item: Folder;
}): JSX.Element => {
	const isAllCalendar = useMemo(() => hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR), [item]);
	const items = useCalendarActions(item);

	return isAllCalendar ? (
		children
	) : (
		<Dropdown items={items} contextMenu width="100%" display="block">
			{children}
		</Dropdown>
	);
};

const RootChildren = ({
	accordionItem,
	item
}: {
	accordionItem: AccordionItemType;
	item: Folder;
}): JSX.Element => {
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();

	const onClick = useCallback(
		(): void =>
			recursiveToggleCheck({
				folder: item,
				checked: !!item.checked,
				dispatch,
				start,
				end,
				query
			}),
		[dispatch, end, item, query, start]
	);
	const SharedStatusIcon = useMemo(() => {
		if (!item.acl?.grant || !item.acl?.grant?.length) {
			return '';
		}

		const tooltipText = t('tooltip.calendar_sharing_status', {
			count: item?.acl?.grant?.length,
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
	}, [item?.acl?.grant]);

	return (
		<ContextMenuItem item={item}>
			<Row onClick={onClick}>
				<Padding left="small" />
				<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
					<AccordionItem item={accordionItem} />
				</Tooltip>
				{SharedStatusIcon}
			</Row>
		</ContextMenuItem>
	);
};

const RootAccount = ({ accordionItem }: { accordionItem: AccordionItemType }): JSX.Element => (
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
);

export const FoldersComponent: FC<FoldersComponentProps> = ({ item }) => {
	const { displayName } = useUserAccount();

	const isRootAccount = useMemo(() => isRoot(item), [item]);
	const accordionItem = useMemo(
		() =>
			({
				...item,
				label:
					item.id === FOLDERS.USER_ROOT
						? displayName
						: getFolderTranslatedName({ folderId: item.id, folderName: item.name }) ?? '',
				icon: getFolderIcon({ item, checked: !!item.checked }),
				iconColor: setCalendarColor({ color: item.color, rgb: item.rgb }).color,
				textProps: { size: 'small' }
			} as AccordionItemType),
		[item, displayName]
	);

	// hide folders where a share was provided and subsequently removed
	if (item.isLink && item.broken) {
		return <></>;
	}

	if (isRootAccount) {
		return <RootAccount accordionItem={accordionItem} />;
	}

	return <RootChildren accordionItem={accordionItem} item={item} />;
};
