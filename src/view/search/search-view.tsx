/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState, useCallback, useEffect } from 'react';
import { Container } from '@zextras/zapp-ui';
import { isEmpty, map, reduce } from 'lodash';
import moment from 'moment';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { searchAppointments } from '../../store/actions/search-appointments';
import { getSelectedEvents } from '../../store/selectors/appointments';
import { selectCalendars } from '../../store/selectors/calendars';
import { Store } from '../../types/store/store';
import SearchList from './search-list';
import SearchPanel from './search-panel';

type SearchProps = {
	useQuery: () => [Array<any>, (arg: any) => void];
	ResultsHeader: FC<{ query: Array<any>; label: string }>;
};

export type SearchResults = {
	appointments: Record<string, string[]>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: Array<{ label: string }>;
};

const SearchView: FC<SearchProps> = ({ useQuery, ResultsHeader }) => {
	const [query, updateQuery] = useQuery();
	const [t] = useTranslation();
	const [searchResults, setSearchResults] = useState<SearchResults>({
		appointments: {},
		more: false,
		offset: 0,
		sortBy: 'none',
		query: []
	});
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const { path } = useRouteMatch();

	const search = useCallback(
		(queryStr: Array<{ label: string }>, reset: boolean) => {
			setLoading(true);
			const spanStart = moment().startOf('day').valueOf();
			const spanEnd = moment().startOf('day').add(1209600000, 'milliseconds').valueOf();
			const queryMap = `"${queryStr.map((c) => c.label).join('" "')}"`;
			dispatch(
				searchAppointments({
					spanStart,
					spanEnd,
					query: queryMap,
					offset: reset ? 0 : searchResults.offset,
					sortBy: searchResults.sortBy
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				}) // @ts-ignore
			).then(({ payload }: any) => {
				setLoading(true);
				const ids = reduce(payload.appt, (acc, v) => ({ ...acc, [v.id]: map(v.inst, 'ridZ') }), {});
				setSearchResults({
					query: queryStr,
					appointments: ids,
					more: payload.more,
					offset: (payload.offset ?? 0) + 100,
					sortBy: payload.sortBy ?? 'none'
				});
				setLoading(false);
			});
		},
		[dispatch, searchResults.offset, searchResults.sortBy, setSearchResults]
	);

	const loadMore = useCallback(() => {
		if (!loading && searchResults && !isEmpty(searchResults.appointments) && searchResults.more) {
			search(query, false);
		}
	}, [loading, query, search, searchResults]);

	useEffect(() => {
		if (query && query.length > 0 && query !== searchResults.query) {
			search(query, true);
		}
	}, [query, search, searchResults.query]);

	const calendars = useSelector(selectCalendars);
	const appointments = useSelector((state: Store) =>
		getSelectedEvents(state, searchResults.appointments ?? [], calendars)
	);
	return (
		<Container style={{ whiteSpace: 'nowrap' }}>
			<ResultsHeader query={[]} label={t('label.results_for', 'Results for:')} />
			<Container orientation="horizontal" style={{ minHeight: '0px' }} mainAlignment="flex-start">
				<Switch>
					<Route path={`${path}/:action?/:apptId?/:ridZ?`}>
						<SearchList loadMore={loadMore} appointments={appointments} loading={loading} />
						<Container background="gray5" width="75%" mainAlignment="center">
							<SearchPanel appointments={appointments} />
						</Container>
					</Route>
				</Switch>
			</Container>
		</Container>
	);
};

export default SearchView;
