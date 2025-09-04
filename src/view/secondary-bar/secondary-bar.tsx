/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { Divider, ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';
import { SecondaryBarComponentProps } from '@zextras/carbonio-shell-ui';

import { PrimaryAccountAccordion } from './primary-account-accordion';
import { SharedAccountsAccordions } from './shared-accounts-accordions';
import { TagsAccordion } from './tags-accordion';

const SecondaryBar: FC<SecondaryBarComponentProps> = ({ expanded }) => (
	<ModalManager>
		<SnackbarManager>
			<PrimaryAccountAccordion />
			<SharedAccountsAccordions />
			<Divider />
			<TagsAccordion />
		</SnackbarManager>
	</ModalManager>
);

export default SecondaryBar;
