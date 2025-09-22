/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { ModalManager, SnackbarManager } from '@zextras/carbonio-design-system';
import { SecondaryBarComponentProps } from '@zextras/carbonio-shell-ui';

import { CollapsedSecondaryBar } from './collapsed-secondary-bar';
import { ExpandedSecondaryBar } from './expanded-secondary-bar';

const SecondaryBar: FC<SecondaryBarComponentProps> = ({ expanded }) => (
	<ModalManager>
		<SnackbarManager>
			{expanded ? <ExpandedSecondaryBar /> : <CollapsedSecondaryBar />}
		</SnackbarManager>
	</ModalManager>
);

export default SecondaryBar;
