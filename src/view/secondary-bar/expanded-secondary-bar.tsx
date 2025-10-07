/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Divider, Container } from '@zextras/carbonio-design-system';

import { PrimaryAccountAccordion } from './primary-account-accordion';
import { SharedAccountsAccordions } from './shared-accounts-accordions';
import { TagsAccordion } from './tags-accordion';

export const ExpandedSecondaryBar = (): React.JSX.Element => (
	<Container data-testid="expanded-secondary-bar" width="fill" height="fit">
		<PrimaryAccountAccordion />
		<SharedAccountsAccordions />
		<Divider />
		<TagsAccordion />
	</Container>
);
