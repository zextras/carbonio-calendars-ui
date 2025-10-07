/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { useRootsArray } from '@zextras/carbonio-ui-commons';

import { SharedAccountAccordion } from './shared-account-accordion';

const MemoizedSharedAccountAccordion = React.memo(SharedAccountAccordion);

export const SharedAccountsAccordions = (): React.JSX.Element => {
	const accountRoots = useRootsArray();

	// Exclude the primary account (first root)
	const sharedAccountsRootsIds = useMemo(
		() => accountRoots.slice(1).map((root) => root.id),
		[accountRoots]
	);

	return (
		<>
			{sharedAccountsRootsIds.map((accountRootId) => (
				<MemoizedSharedAccountAccordion key={accountRootId} rootId={accountRootId} />
			))}
		</>
	);
};
