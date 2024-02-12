/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { compact, map, sortBy } from 'lodash';

import { IdentityItem } from '../types/editor';

export const getIdentityItems = (): Array<IdentityItem> => {
	const account = getUserAccount();

	const sortedList = sortBy(account?.identities.identity, ({ name }) =>
		name === 'DEFAULT' ? 0 : 1
	);

	return map(sortedList, (item, idx) => {
		const name = item.name ? `${item.name}` : undefined;
		const display = item._attrs?.zimbraPrefFromDisplay
			? `${item._attrs?.zimbraPrefFromDisplay} `
			: undefined;
		const fromAddress = item._attrs?.zimbraPrefFromAddress
			? `(<${item._attrs?.zimbraPrefFromAddress}>) `
			: undefined;
		const label = compact([name, display, fromAddress]).join(' ');
		return {
			value: `${idx}`,
			label,
			address: item._attrs?.zimbraPrefFromAddress,
			fullName: item._attrs?.zimbraPrefFromDisplay,
			type: item._attrs?.zimbraPrefFromAddressType,
			identityName: item.name
		};
	});
};
