/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import {
	AccordionItem,
	AccordionItemProps,
	AccordionItemType,
	Dropdown
} from '@zextras/carbonio-design-system';
import { useRunSearchIntegration, useTags, resolveTagColorHex } from '@zextras/carbonio-ui-commons';

import { CALENDAR_ROUTE } from '../../../constants';
import { useGetTagsActions } from '../../tags/tag-actions';

export const TagAccordionItem: FC<AccordionItemProps> = (props) => {
	const tagId = props.item.id;
	const tag = Object.values(useTags(tagId))?.[0];
	const actions = useGetTagsActions({ tag });
	const runSearch = useRunSearchIntegration();

	const onClickAccordionItem = useCallback(
		() =>
			runSearch?.(
				[
					{
						avatarBackground: resolveTagColorHex(tag),
						avatarIcon: 'Tag',
						background: 'gray2',
						hasAvatar: true,
						label: `tag:${tag.name}`,
						value: `tag:"${tag.name}"`
					}
				],
				CALENDAR_ROUTE
			),
		[tag, runSearch]
	);

	const item: AccordionItemType = useMemo(
		() => ({
			id: tag.id,
			icon: 'Tag',
			label: tag.name,
			iconColor: resolveTagColorHex(tag)
		}),
		[tag]
	);

	return (
		<Dropdown contextMenu display="block" items={actions} onClick={onClickAccordionItem}>
			<AccordionItem {...props} item={item} />
		</Dropdown>
	);
};
