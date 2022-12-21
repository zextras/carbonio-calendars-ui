/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, List } from '@zextras/carbonio-design-system';
import React, { ReactComponentElement } from 'react';
import { useParams } from 'react-router-dom';
import { sortBy } from 'lodash';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SearchListItem from './search-list-item';
import ShimmerList from './shimmer-list';

type SearchListProps = {
	appointments: Array<any>;
	loadMore: () => any;
	loading: boolean;
};

export type RoutesParams = {
	action: 'view' | 'edit';
	apptId: string;
	ridZ: string;
};

const SearchList = ({
	appointments,
	loadMore,
	loading
}: SearchListProps): ReactComponentElement<any> => {
	const { apptId, ridZ } = useParams<RoutesParams>();

	return (
		<Container
			background="gray6"
			width="25%"
			mainAlignment="flex-start"
			data-testid="CalendarsSearchResultListContainer"
		>
			{loading ? (
				<ShimmerList />
			) : (
				<List
					items={sortBy(appointments ?? [], ['start'])}
					ItemComponent={SearchListItem}
					active={`${apptId}:${ridZ}`}
					onListBottom={loadMore}
					background="gray6"
					data-testid="SearchResultCalendarsContainer"
				/>
			)}
		</Container>
	);
};

export default SearchList;
