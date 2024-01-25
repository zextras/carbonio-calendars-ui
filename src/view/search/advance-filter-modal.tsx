/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useState, useCallback, useMemo, useEffect } from 'react';

import { CustomModal, Container, ChipProps } from '@zextras/carbonio-design-system';
import { QueryChip, t } from '@zextras/carbonio-shell-ui';
import { concat, filter, includes, map } from 'lodash';

import FromDateToDateRow from './parts/from-date-to-date-row';
import KeywordRow from './parts/keyword-row';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { DEFAULT_DATE_START, DEFAULT_DATE_END } from '../../constants/advance-filter-modal';

type KeywordState = Array<{
	id: string;
	label: string;
	hasAvatar?: boolean;
	value?: string;
	isQueryFilter?: boolean;
	isGeneric?: boolean;
	avatarIcon?: string;
	avatarBackground?: ChipProps['background'];
	hasError?: boolean;
	error?: boolean;
}>;

type AdvancedFilterModalProps = {
	open: boolean;
	dateStart: number;
	dateEnd: number;
    setDateStart: (arg: number) => void;
    setDateEnd: (arg: number) => void;
	onClose: () => void;
	query: Array<{
		id: string;
		label: string;
		value?: string;
		isGeneric?: boolean;
		isQueryFilter?: boolean;
	}>;
	updateQuery: (arg: Array<QueryChip>) => void;
};

const AdvancedFilterModal: FC<AdvancedFilterModalProps> = ({
	open,
	onClose,
	query,
	updateQuery,
	dateStart,
	dateEnd,
    setDateStart,
    setDateEnd
}): ReactElement => {
	const [otherKeywords, setOtherKeywords] = useState<KeywordState>([]);

	const [folder, setFolder] = useState<KeywordState>([]);
	const [fromDate, setFromDate] = useState<any>(dateStart);
	const [toDate, setToDate] = useState<any>(dateEnd);
	const queryArray = useMemo(() => ['has:attachment', 'is:flagged', 'is:unread'], []);

	useEffect(() => {
		const updatedQuery = map(
			filter(
				query,
				(v) =>
					!includes(queryArray, v.label) &&
					!/^Is:/.test(v.label) &&
					!v.isQueryFilter
			),
			(q) => ({ ...q, hasAvatar: false })
		);
		setOtherKeywords(updatedQuery);
	}, [query, queryArray]);
    


	const resetFilters = useCallback(() => {
        setFromDate(DEFAULT_DATE_START);
        setDateStart(DEFAULT_DATE_START);
        setToDate(DEFAULT_DATE_END);
        setDateEnd(DEFAULT_DATE_END);
        updateQuery([]);
		setFolder([]);
	}, [setDateEnd, setDateStart, updateQuery]);

	const queryToBe = useMemo<Array<QueryChip>>(
		() => concat(otherKeywords, folder),
		[folder, otherKeywords]
	);

	const onConfirm = useCallback(() => {
		updateQuery(queryToBe);
        setDateStart(fromDate.valueOf());
        setDateEnd(toDate.valueOf());
		onClose();
	}, [updateQuery, queryToBe, setDateStart, fromDate, setDateEnd, toDate, onClose]);

	const keywordRowProps = useMemo(
		() => ({
			otherKeywords,
			setOtherKeywords
		}),
		[otherKeywords]
	);

	return (
		<CustomModal open={open} onClose={onClose} maxHeight="90vh" size="medium">
			<Container padding={{ bottom: 'medium' }}>
				<ModalHeader
					onClose={onClose}
					title={t('label.single_advanced_filter', 'Advanced Filters')}
				/>

				<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
					<KeywordRow compProps={keywordRowProps} />
					<FromDateToDateRow
						fromDate={fromDate}
						setFromDate={setFromDate}
						toDate={toDate}
						setToDate={setToDate}
					/>
				</Container>
				<ModalFooter
					onConfirm={onConfirm}
					label={t('action.search', 'Search')}
					secondaryLabel={t('action.reset', 'Reset')}
					secondaryAction={resetFilters}
					secondaryBtnType="outlined"
					secondaryColor="primary"
					paddingTop="small"
				/>
			</Container>
		</CustomModal>
	);
};

export default AdvancedFilterModal;
