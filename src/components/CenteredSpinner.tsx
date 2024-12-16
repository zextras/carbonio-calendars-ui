/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Spinner } from '@zextras/carbonio-design-system';

export const CenteredSpinner = (): React.JSX.Element => (
	<Container>
		<Spinner color={'primary'} />
	</Container>
);
