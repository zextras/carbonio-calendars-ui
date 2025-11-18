/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import type { QueryChip, SearchViewProps } from '@zextras/carbonio-search-ui';
import {
	FOLDERS,
	convertSearchChipToString,
	useUpdateView,
	useFoldersMap,
	Folder,
	usePrefs,
	hasId
} from '@zextras/carbonio-ui-commons';
import { isEmpty, map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';

import { AdvancedFilterModal } from './advance-filter-modal';
import SearchList from './search-list';
import SearchPanel from './search-panel';
import { DEFAULT_DATE_END, DEFAULT_DATE_START } from '../../constants/advance-filter-modal';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { getSelectedEvents } from '../../store/selectors/appointments';

export type SearchResults = {
	appointments: Record<string, string[]>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: QueryChip[];
};

const specialChars = [
	'~',
	"'",
	'!',
	'#',
	'$',
	'%',
	'^',
	'&',
	'(',
	')',
	'_',
	'?',
	'/',
	'{',
	'}',
	'[',
	']',
	';',
	':',
	'-',
	'+',
	'<',
	'>'
];

const SearchView: FC<SearchViewProps> = ({ useQuery, ResultsHeader }) => {
	const initialSearchResults = useMemo(
		() => ({
			appointments: {},
			more: false,
			offset: 0,
			sortBy: 'none',
			query: []
		}),
		[]
	);
	const [query, updateQuery] = useQuery();
	const [t] = useTranslation();
	const [searchResults, setSearchResults] = useState<SearchResults>(initialSearchResults);
	const [loading, setLoading] = useState(false);
	const dispatch = useAppDispatch();
	const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
	const { zimbraPrefIncludeTrashInSearch, zimbraPrefIncludeSharedItemsInSearch } = usePrefs();
	const defaultResultLabel = useMemo(() => t('label.results_for', 'Results for: '), [t]);
	const [isInvalidQuery, setIsInvalidQuery] = useState<boolean>(false);
	const [includeTrash, includeSharedFolders] = useMemo(
		() => [
			zimbraPrefIncludeTrashInSearch === 'TRUE',
			zimbraPrefIncludeSharedItemsInSearch === 'TRUE'
		],
		[zimbraPrefIncludeTrashInSearch, zimbraPrefIncludeSharedItemsInSearch]
	);

	const invalidQueryTooltip = useMemo(
		() =>
			t(
				'label.invalid_query',
				'Special characters like :, ", -, !, etc., are ignored in the search. This may lead to unexpected results for:'
			),
		[t]
	);

	const containsSpecialCharacter = useMemo(() => {
		if (!query || query.length === 0) return false;

		const relevantQuery = query.filter((chip: any) => {
			if ('queryChipsToAdvancedFiltersValue' in chip) return false;
			if (chip.isQueryFilter) return false;
			return true;
		});

		const queryString = relevantQuery.map((c) => convertSearchChipToString(c)).join(' ');
		return specialChars.some((char) => queryString.includes(char));
	}, [query]);

	const resultLabelType = containsSpecialCharacter ? 'warning' : undefined;

	const resultLabel = useMemo(() => {
		if (containsSpecialCharacter) {
			return invalidQueryTooltip;
		}
		return defaultResultLabel;
	}, [containsSpecialCharacter, invalidQueryTooltip, defaultResultLabel]);

	const calendars = useFoldersMap();
	useUpdateView();
	const searchInFolders = useMemo(
		() =>
			reduce(
				calendars,
				(acc: Array<string>, v: Folder) => {
					if (hasId(v, FOLDERS.TRASH) && includeTrash && v.checked) {
						acc.push(v.id);
					}
					if (v.isLink && includeSharedFolders && v.checked) {
						acc.push(v.id);
					}
					if (!hasId(v, FOLDERS.TRASH) && !v.isLink && v.checked) acc.push(v.id);
					return acc;
				},
				[]
			),
		[calendars, includeSharedFolders, includeTrash]
	);

	const foldersToSearchInQuery = useMemo(() => {
		const folderString = map(searchInFolders, (folder) => `inid:"${folder}"`).join(' OR ');
		return `(${folderString})`;
	}, [searchInFolders]);

	const [spanStart, setSpanStart] = useState(() => DEFAULT_DATE_START);
	const [spanEnd, setSpanEnd] = useState(() => DEFAULT_DATE_END);

	const search = useCallback(
		(queryStr: QueryChip[], reset: boolean) => {
			setLoading(true);

			const queryString = queryStr.map((c) => convertSearchChipToString(c)).join(' ');
			const queryMap = `(${queryString}) ${foldersToSearchInQuery}`;
			dispatch(
				searchAppointments({
					spanStart,
					spanEnd,
					query: queryMap,
					offset: reset ? 0 : searchResults.offset,
					sortBy: searchResults.sortBy
				})
			)
				.then(({ payload }) => {
					setLoading(false);
					if (payload) {
						const ids = reduce(
							payload.appt,
							(acc, v) => ({ ...acc, [v.id]: map(v.inst, 'ridZ') }),
							{}
						);
						setSearchResults({
							query: queryStr,
							appointments: ids,
							more: payload.more ?? false,
							offset: (payload.offset ?? 0) + 100,
							sortBy: payload.sortBy ?? 'none'
						});
					}
				})

				.catch(() => {
					setLoading(false);
					const tempDestructuring = [...queryStr];
					const newQueryStr = map(tempDestructuring, (qs) => ({
						...qs,
						disabled: true,
						isQueryFilter: true
					}));
					updateQuery(newQueryStr);
					setIsInvalidQuery(true);

					setSearchResults(initialSearchResults);
					setSpanStart(DEFAULT_DATE_START);
					setSpanEnd(DEFAULT_DATE_END);
				});
		},
		[
			foldersToSearchInQuery,
			dispatch,
			spanStart,
			spanEnd,
			searchResults.offset,
			searchResults.sortBy,
			updateQuery,
			initialSearchResults
		]
	);

	const loadMore = useCallback(() => {
		if (!loading && searchResults && !isEmpty(searchResults.appointments) && searchResults.more) {
			search(query, false);
		}
	}, [loading, query, search, searchResults]);

	useEffect(() => {
		if (query && query.length > 0 && query !== searchResults.query && !isInvalidQuery) {
			search(query, true);
		}
		if (query && query.length === 0) {
			setIsInvalidQuery(false);
			setSearchResults(initialSearchResults);
			setSpanStart(DEFAULT_DATE_START);
			setSpanEnd(DEFAULT_DATE_END);
		}
	}, [
		query,
		search,
		searchResults.query,
		isInvalidQuery,
		defaultResultLabel,
		initialSearchResults,
		setSpanStart,
		setSpanEnd
	]);

	const appointments = useAppSelector((state) =>
		getSelectedEvents(state, searchResults.appointments ?? [], calendars)
	);

	return (
		<>
			<Container style={{ whiteSpace: 'nowrap' }}>
				<ResultsHeader label={query.length > 0 ? resultLabel : ''} labelType={resultLabelType} />
				<Container orientation="horizontal" style={{ minHeight: '0' }} mainAlignment="flex-start">
					<Routes>
						<Route
							path={`:action?/:apptId?/:ridZ?`}
							element={
								<>
									<SearchList
										query={query}
										loadMore={loadMore}
										appointments={appointments}
										loading={loading}
										setShowAdvanceFilters={setShowAdvanceFilters}
										searchDisabled={false}
										dateStart={spanStart}
										dateEnd={spanEnd}
									/>
									<Container background={'gray5'} width="75%" mainAlignment="center">
										<SearchPanel appointments={appointments} />
									</Container>
								</>
							}
						/>
					</Routes>
				</Container>
			</Container>
			<AdvancedFilterModal
				// TOFIX-SHELL: fix updateQueryFunction inside shell type
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				query={query}
				updateQuery={updateQuery}
				open={showAdvanceFilters}
				onClose={(): void => setShowAdvanceFilters(false)}
				dateStart={spanStart}
				dateEnd={spanEnd}
				setDateStart={setSpanStart}
				setDateEnd={setSpanEnd}
			/>
		</>
	);
};

export default SearchView;
