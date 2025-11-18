/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, List, Row, Text, Padding, ListItem } from '@zextras/carbonio-design-system';
// eslint-disable-next-line import/no-extraneous-dependencies
import { QueryChip } from '@zextras/carbonio-search-ui';
import { t } from '@zextras/carbonio-shell-ui';
import { map, sortBy } from 'lodash';
import moment from 'moment';

import { AdvancedFilterButton } from './parts/advanced-filter-button';
import SearchListItem from './search-list-item';
import ShimmerList from './shimmer-list';
import { EventType } from 'types/event';

type SearchListProps = {
	appointments: Array<EventType>;
	loadMore: () => void;
	loading: boolean;
	searchDisabled: boolean;
	setShowAdvanceFilters: (show: boolean) => void;
	dateStart: number;
	dateEnd: number;
	query: Array<QueryChip>;
};

const SearchList = ({
	appointments,
	loadMore,
	loading,
	searchDisabled,
	setShowAdvanceFilters,
	dateStart,
	dateEnd,
	query
}: SearchListProps): React.JSX.Element => {
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

	const dateStartValue = moment(dateStart).format('DD/MM/YYYY');

	const dateStartString = useMemo(
		() => `${t('search.from_date', 'From Date')} ${dateStartValue}`,
		[dateStartValue]
	);

	const dateEndValue = moment(dateEnd).format('DD/MM/YYYY');

	const dateEndString = useMemo(
		() => `${t('search.to_date', 'to Date')} ${dateEndValue}`,
		[dateEndValue]
	);

	const displayerTitle = useMemo(() => {
		if (appointments.length === 0 && query.length > 0) {
			return t(
				'displayer.search_list_title1',
				'It looks like there are no results. Keep searching!'
			);
		}
		return null;
	}, [appointments.length, query.length]);

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
					{query.length > 0 ? dateStartString : ''}
				</Text>
				<Padding left="medium" />
				<Text size="medium" color="secondary">
					{query.length > 0 ? dateEndString : ''}
				</Text>
			</Row>
			<AdvancedFilterButton
				setShowAdvanceFilters={setShowAdvanceFilters}
				searchDisabled={searchDisabled}
			/>
			{loading ? (
				<ShimmerList />
			) : (
				<Container style={{ overflow: 'hidden' }}>
					{appointments.length > 0 ? (
						<List
							onListBottom={loadMore}
							background={'gray6'}
							data-testid="SearchResultCalendarsContainer"
						>
							{items}
						</List>
					) : (
						<Container>
							<Padding top="medium">
								<Text
									data-testid="displayer-title"
									color="gray1"
									overflow="break-word"
									size="small"
									style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
								>
									{displayerTitle}
								</Text>
							</Padding>
						</Container>
					)}
				</Container>
			)}
		</Container>
	);
};

export default SearchList;
