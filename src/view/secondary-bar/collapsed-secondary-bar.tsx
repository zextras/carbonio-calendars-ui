/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useRootsArray } from '@zextras/carbonio-ui-commons';

import { CollapsedSidebarItem } from './collapsed-sidebar-items';

export const CollapsedSecondaryBar = (): React.JSX.Element => {
	const folders = useRootsArray();

	return (
		<Container data-testid="collapsed-secondary-bar" width="fill" height="fit">
			{folders[0].children.map((folder) => (
				<CollapsedSidebarItem key={folder.id} item={folder} />
			))}
		</Container>
	);
};
