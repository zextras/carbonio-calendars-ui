/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import type { QueryChip, SearchViewProps } from '@zextras/carbonio-search-ui';
import { isEmpty, map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';

import AdvancedFilterModal from './advance-filter-modal';
import SearchList from './search-list';
import SearchPanel from './search-panel';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { useUpdateView } from '../../carbonio-ui-commons/hooks/use-update-view';
import { useFoldersMap } from '../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { usePrefs } from '../../carbonio-ui-commons/utils/use-prefs';
import { hasId } from '../../carbonio-ui-commons/worker/handle-message';
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

const SearchView: FC<SearchViewProps> = ({ useQuery, ResultsHeader }) => {
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
	const dispatch = useAppDispatch();
	const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
	const { zimbraPrefIncludeTrashInSearch, zimbraPrefIncludeSharedItemsInSearch } = usePrefs();
	const defaultResultLabel = useMemo(() => t('label.results_for', 'Results for: '), [t]);
	const [resultLabel, setResultLabel] = useState<string>(defaultResultLabel);
	const [isInvalidQuery, setIsInvalidQuery] = useState<boolean>(false);
	const [includeTrash, includeSharedFolders] = useMemo(
		() => [
			zimbraPrefIncludeTrashInSearch === 'TRUE',
			zimbraPrefIncludeSharedItemsInSearch === 'TRUE'
		],
		[zimbraPrefIncludeTrashInSearch, zimbraPrefIncludeSharedItemsInSearch]
	);

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
			setResultLabel(defaultResultLabel);
			setLoading(true);

			const chipToString = (c: QueryChip): string => {
				const chipString = (c.value ? c.value : c.label) ?? '';
				const thereAreAnySpaces = chipString?.indexOf(' ') >= 0;
				return thereAreAnySpaces ? `"${chipString}"` : `${chipString}`;
			};

			const queryString = queryStr.map((c) => chipToString(c)).join(' ');
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
					setLoading(true);
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
					setLoading(false);
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

					setResultLabel(
						t('label.results_for_error', 'Unable to start the search, clear it and retry: ')
					);
				});
		},
		[
			defaultResultLabel,
			foldersToSearchInQuery,
			dispatch,
			spanStart,
			spanEnd,
			searchResults.offset,
			searchResults.sortBy,
			updateQuery,
			t
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
			setResultLabel(defaultResultLabel);
			setSearchResults({
				appointments: {},
				more: false,
				offset: 0,
				sortBy: 'none',
				query: []
			});
		}
	}, [query, search, searchResults.query, isInvalidQuery, t, defaultResultLabel]);

	const appointments = useAppSelector((state) =>
		getSelectedEvents(state, searchResults.appointments ?? [], calendars)
	);

	return (
		<>
			<Container style={{ whiteSpace: 'nowrap' }}>
				<ResultsHeader label={query.length > 0 ? resultLabel : ''} />
				<Container orientation="horizontal" style={{ minHeight: '0' }} mainAlignment="flex-start">
					<Routes>
						<Route
							path={`:action?/:apptId?/:ridZ?`}
							element={
								<>
									<SearchList
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
				// TOFIX-SHELL: fix updateQueryFunction inside shell type
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
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
