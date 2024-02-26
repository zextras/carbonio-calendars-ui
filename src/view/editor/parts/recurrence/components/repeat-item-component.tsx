/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { TextUpperCase } from '../../../../../commons/styled-components';

const RepeatItemComponent = ({ label }: { label: string }): ReactElement => (
	<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
		<TextUpperCase>{label}</TextUpperCase>
	</Container>
);

export default RepeatItemComponent;
