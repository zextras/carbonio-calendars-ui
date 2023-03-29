/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import React from 'react';

type SearchResultsHeaderProps = {
	searchString: Array<{ label: string }>;
	resultsCount: number | undefined;
};

const SearchResultsHeader = ({ searchString, resultsCount }: SearchResultsHeaderProps): any => (
	<Container
		orientation="horizontal"
		background="gray4"
		mainAlignment="flex-start"
		minWidth="16rem"
		height="fit"
		padding={{ all: 'large' }}
	>
		<Container
			orientation="horizontal"
			width="fit"
			mainAlignment="flex-start"
			padding={{ left: 'medium' }}
		>
			<Text size="large" color="secondary">
				{t('label.results_for', 'Results for:')}
			</Text>
		</Container>
		<Container
			orientation="horizontal"
			width="fill"
			mainAlignment="space-between"
			padding={{ left: 'extrasmall' }}
		>
			<Text size="large" weight="bold">
				{searchString && searchString.map((i) => i.label).join(' ')}
			</Text>
			<Text size="large">{resultsCount}</Text>
		</Container>
	</Container>
);

export default SearchResultsHeader;
