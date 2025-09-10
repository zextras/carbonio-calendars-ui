/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import {
	AccordionItem,
	AccordionItemProps,
	AccordionItemType,
	Dropdown,
	useModal
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { SIDEBAR_ITEMS } from '../../../constants/sidebar';
import { createTag } from '../../tags/tag-actions';

export const TagsAggregatorAccordionItem: FC<AccordionItemProps> = (props) => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();
	const actions = [createTag({ createModal, closeModal })];
	const item: AccordionItemType = {
		id: SIDEBAR_ITEMS.TAGS,
		icon: 'TagsMoreOutline',
		label: t('label.tags', 'Tags')
	};

	return (
		<Dropdown contextMenu display="block" items={actions}>
			<AccordionItem {...props} item={item} />
		</Dropdown>
	);
};
