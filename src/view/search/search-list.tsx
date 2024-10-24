/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, List, Row, Text, Padding, ListItem } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { map, sortBy } from 'lodash';
import moment from 'moment';
import { useParams } from 'react-router-dom';

import { AdvancedFilterButton } from './parts/advanced-filter-button';
import SearchListItem from './search-list-item';
import ShimmerList from './shimmer-list';

type SearchListProps = {
	appointments: Array<any>;
	loadMore: () => any;
	loading: boolean;
	searchDisabled: boolean;
	filterCount: number;
	setShowAdvanceFilters: (show: boolean) => void;
	dateStart: number;
	dateEnd: number;
};

export type RoutesParams = {
	action: 'view' | 'edit';
	apptId: string;
	ridZ: string;
};

const SearchList = ({
	appointments,
	loadMore,
	loading,
	searchDisabled,
	filterCount,
	setShowAdvanceFilters,
	dateStart,
	dateEnd
}: SearchListProps): React.JSX.Element => {
	const { apptId, ridZ } = useParams<RoutesParams>();
	const items = useMemo(
		() =>
			map(sortBy(appointments ?? [], ['start']), (item) => (
				<ListItem key={item.id}>
					{(visible): React.JSX.Element =>
						visible ? (
							<SearchListItem key={item.id} item={item} />
						) : (
							<div style={{ height: '4rem' }}></div>
						)
					}
				</ListItem>
			)),
		[appointments]
	);

	return (
		<Container
			background={'gray6'}
			width="25%"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="CalendarsSearchResultListContainer"
		>
			<Row
				padding={{ horizontal: 'small', top: 'medium', bottom: 'small' }}
				orientation="horizontal"
				mainAlignment="flex-start"
			>
				<Text size="medium" color="secondary">
					{t('search.from_date', 'From Date')} {moment(dateStart).format('DD/MM/YYYY')}
				</Text>
				<Padding left="medium" />
				<Text size="medium" color="secondary">
					{t('search.to_date', 'to Date')} {moment(dateEnd).format('DD/MM/YYYY')}
				</Text>
			</Row>
			<AdvancedFilterButton
				setShowAdvanceFilters={setShowAdvanceFilters}
				filterCount={filterCount}
				searchDisabled={searchDisabled}
			/>
			{loading ? (
				<ShimmerList />
			) : (
				<Container style={{ overflow: 'hidden' }}>
					<List
						onListBottom={loadMore}
						background={'gray6'}
						data-testid="SearchResultCalendarsContainer"
					>
						{items}
					</List>
				</Container>
			)}
		</Container>
	);
};

export default SearchList;
