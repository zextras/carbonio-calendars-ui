/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Accordion } from '@zextras/carbonio-design-system';

import { useSecondaryBarTreePrimaryAccount } from './use-secondary-bar-tree-primary-account';

export const PrimaryAccountAccordion = (): React.JSX.Element => {
	const primaryAccountItem = useSecondaryBarTreePrimaryAccount();

	const primaryAccountItems = useMemo(() => [primaryAccountItem], [primaryAccountItem]);

	return <Accordion items={primaryAccountItems} disableTransition />;
};
