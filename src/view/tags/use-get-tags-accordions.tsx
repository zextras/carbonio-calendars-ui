/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, SyntheticEvent, useCallback, useMemo } from 'react';

import {
	AccordionItem,
	Dropdown,
	Row,
	Icon,
	Padding,
	Tooltip,
	useModal
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	ItemType,
	useRunSearchIntegration,
	ZIMBRA_STANDARD_COLORS,
	TagsAccordionItems,
	useSortedTagsArray
} from '@zextras/carbonio-ui-commons';
import { reduce } from 'lodash';

import { createTag, useGetTagsActions } from './tag-actions';
import { CALENDAR_ROUTE } from '../../constants';

type ItemProps = {
	item: ItemType;
};

const CustomComp: FC<ItemProps> = (props) => {
	const actions = useGetTagsActions({ tag: props?.item });

	const runSearch = useRunSearchIntegration();

	const triggerSearch = useCallback(
		() =>
			runSearch?.(
				[
					{
						avatarBackground: ZIMBRA_STANDARD_COLORS[props?.item?.color || 0].hex,
						avatarIcon: 'Tag',
						background: 'gray2',
						hasAvatar: true,
						label: `tag:${props?.item?.name}`,
						value: `tag:"${props?.item?.name}"`
					}
				],
				CALENDAR_ROUTE
			),
		[props?.item?.color, props?.item?.name, runSearch]
	);

	return (
		<Dropdown
			contextMenu
			items={actions}
			display="block"
			width="fit-content"
			onClick={triggerSearch}
		>
			<Row mainAlignment="flex-start" height="fit" padding={{ left: 'large' }} takeAvailableSpace>
				<Icon size="large" icon="Tag" color={ZIMBRA_STANDARD_COLORS[props?.item?.color ?? 0].hex} />

				<Padding right="large" />
				<Tooltip label={props?.item?.name} placement="right" maxWidth="100%">
					<AccordionItem {...props} height="2.5rem" />
				</Tooltip>
			</Row>
		</Dropdown>
	);
};

export const TagLabel: FC<ItemType> = (props) => {
	const { createModal, closeModal } = useModal();
	return (
		<Dropdown
			contextMenu
			display="block"
			width="fit"
			items={[createTag({ createModal, closeModal })]}
		>
			<Row mainAlignment="flex-start" padding={{ horizontal: 'large' }} takeAvailableSpace>
				<Icon size="large" icon="TagsMoreOutline" /> <Padding right="large" />
				<AccordionItem {...{ ...props, color: `${props.color}` }} height="2.5rem" />
			</Row>
		</Dropdown>
	);
};

const useGetTagsAccordion = (): TagsAccordionItems => {
	const tagsFromStore = useSortedTagsArray();

	return useMemo(
		() => ({
			id: 'Tags',
			label: t('label.tags', 'Tags'),
			active: false,
			open: false,
			onClick: (e: SyntheticEvent<Element, Event> | KeyboardEvent): void => {
				e.stopPropagation();
			},
			CustomComponent: TagLabel,
			items: reduce(
				tagsFromStore,
				(acc: Array<ItemType>, v) => {
					const item = {
						id: v.id,
						item: v,
						active: false,
						color: v.color || 0,
						label: v.name,
						name: v.name,
						open: false,
						CustomComponent: CustomComp
					};
					acc.push(item);
					return acc;
				},
				[]
			)
		}),
		[tagsFromStore]
	);
};

export default useGetTagsAccordion;
