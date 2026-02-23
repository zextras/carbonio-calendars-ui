/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Accordion } from '@zextras/carbonio-design-system';

import { useSecondaryBarTreeTags } from './use-secondary-bar-tree-tags';

export const TagsAccordion = (): React.JSX.Element => {
	const items = useSecondaryBarTreeTags();
	return <Accordion items={items} disableTransition />;
};
