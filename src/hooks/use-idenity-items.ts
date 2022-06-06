/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { map, sortBy } from 'lodash';
import { useMemo } from 'react';
import { IdentityItem } from '../types/editor';

export const useIdentityItems = (): Array<IdentityItem> => {
	const account = useUserAccount();

	return useMemo(() => {
		const sortedList = sortBy(account.identities.identity, ({ name }) =>
			name === 'DEFAULT' ? 0 : 1
		);

		return map(sortedList, (item, idx) => {
			const name = item.name ? `${item.name} ` : '';
			const display = item._attrs?.zimbraPrefFromDisplay
				? `${item._attrs?.zimbraPrefFromDisplay} `
				: '';
			const fromAddress = item._attrs?.zimbraPrefFromAddress
				? `(<${item._attrs?.zimbraPrefFromAddress}>) `
				: '';
			return {
				value: idx,
				label: `${name}${display}${fromAddress}`,
				address: item._attrs?.zimbraPrefFromAddress,
				fullName: item._attrs?.zimbraPrefFromDisplay,
				type: item._attrs.zimbraPrefFromAddressType,
				identityName: item.name
			};
		});
	}, [account.identities.identity]);
};
