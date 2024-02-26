/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import {
	Container,
	Text,
	Accordion,
	AccordionItemType,
	AccordionDivider
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import styled from 'styled-components';

const ContainerEl = styled(Container)`
	overflow-y: auto;
	display: block;
`;

export const FolderItem = ({
	folders
}: {
	folders: (AccordionItemType | AccordionDivider)[];
}): ReactElement =>
	folders.length ? (
		<ContainerEl
			orientation="vertical"
			mainAlignment="flex-start"
			minHeight="30vh"
			maxHeight="59vh"
		>
			<Accordion items={folders} background="gray6" />
		</ContainerEl>
	) : (
		<Container padding={{ all: 'small' }}>
			<Text size="large"> {t('label.empty', 'Empty')} </Text>
		</Container>
	);
