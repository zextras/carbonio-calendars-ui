/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTags, ZIMBRA_STANDARD_COLORS, runSearch } from '@zextras/carbonio-shell-ui';
import {
	AccordionItem,
	Dropdown,
	Row,
	Icon,
	Padding,
	Tooltip
} from '@zextras/carbonio-design-system';
import { reduce } from 'lodash';
import { useGetTagsActions } from '../view/tags/tag-actions';
import { CALENDAR_ROUTE } from '../constants';

type ItemType = {
	CustomComponent: ReactElement | any;
	active: boolean;
	color: number;
	divider: boolean;
	id: string;
	label: string;
	name: string;
	open: boolean;
	actions?: Array<unknown>;
};
type ItemProps = {
	item: ItemType;
};

const CustomComp = (props: ItemProps): ReactElement => {
	const actions = useGetTagsActions({ tag: props?.item });
	const triggerSearch = useCallback(
		() =>
			runSearch(
				[
					{
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						avatarBackground: ZIMBRA_STANDARD_COLORS[props?.item?.color || 0].hex,
						avatarIcon: 'Tag',
						background: 'gray2',
						hasAvatar: true,
						isGeneric: false,
						isQueryFilter: true,
						label: `tag:${props?.item?.name}`,
						value: `tag:"${props?.item?.name}"`
					}
				],
				CALENDAR_ROUTE
			),
		[props?.item?.color, props?.item?.name]
	);

	return (
		<Dropdown contextMenu items={actions} display="block" width="fit" onClick={triggerSearch}>
			<Row mainAlignment="flex-start" height="fit" padding={{ left: 'large' }} takeAvailableSpace>
				<Icon
					size="large"
					icon="Tag"
					customColor={ZIMBRA_STANDARD_COLORS[props?.item?.color].hex}
				/>
				<Padding right="large" />
				<Tooltip label={props?.item?.name} placement="right" maxWidth="100%">
					<AccordionItem {...props} height={40} />
				</Tooltip>
			</Row>
		</Dropdown>
	);
};
const useGetTagsAccordion = (): ItemType[] => {
	const tagsFromStore = useTags();
	return useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc: Array<ItemType>, v) => {
					const item = {
						id: v.id,
						active: false,
						color: v.color || 0,
						divider: false,
						label: v.name,
						name: v.name,
						open: false,
						CustomComponent: CustomComp
					};
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					acc.push(item);
					return acc;
				},
				[]
			),
		[tagsFromStore]
	);
};

export default useGetTagsAccordion;
