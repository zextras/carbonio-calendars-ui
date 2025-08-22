/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useState, useCallback, useMemo, useEffect } from 'react';

import {
	CustomModal,
	Container,
	ChipProps,
	ModalHeader,
	Divider,
	ModalFooter
} from '@zextras/carbonio-design-system';
import type { QueryChip } from '@zextras/carbonio-search-ui';
import { t } from '@zextras/carbonio-shell-ui';
import { concat, filter, map } from 'lodash';

import FromDateToDateRow from './parts/from-date-to-date-row';
import KeywordRow from './parts/keyword-row';
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

export type AdvancedFilterModalProps = {
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
		queryChipsToAdvancedFiltersValue?: any;
	}>;
	updateQuery: (arg: Array<QueryChip>) => void;
};

export const AdvancedFilterModal: FC<AdvancedFilterModalProps> = ({
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
	const [selectedFromDate, setSelectedFromDate] = useState<Date | null>(new Date(dateStart));
	const [selectedToDate, setSelectedToDate] = useState<Date | null>(new Date(dateEnd));

	useEffect(() => {
		if (open) {
			setSelectedFromDate(new Date(dateStart));
			setSelectedToDate(new Date(dateEnd));
		}
	}, [open, dateStart, dateEnd]);

	useEffect(() => {
		if (query.length === 0) {
			setSelectedFromDate(new Date(DEFAULT_DATE_START));
			setSelectedToDate(new Date(DEFAULT_DATE_END));
		}
	}, [query.length]);

	useEffect(() => {
		if (!open) return;

		const updatedQuery = map(
			filter(query, (v) => {
				if (v.isQueryFilter) return false;
				if ('queryChipsToAdvancedFiltersValue' in v) return false;
				return true;
			}),
			({ id, label, value }) => ({
				id,
				label,
				value,
				hasAvatar: false
			})
		);
		setOtherKeywords(updatedQuery);
	}, [query, open]);

	const resetFilters = useCallback(() => {
		setSelectedFromDate(new Date(DEFAULT_DATE_START));
		setSelectedToDate(new Date(DEFAULT_DATE_END));
		setOtherKeywords([]);
	}, []);

	const queryToBe = useMemo<Array<QueryChip>>(() => concat(otherKeywords), [otherKeywords]);

	const secondaryDisabled = useMemo(
		() =>
			queryToBe.length === 0 &&
			selectedFromDate?.getTime() === DEFAULT_DATE_START &&
			selectedToDate?.getTime() === DEFAULT_DATE_END,
		[queryToBe.length, selectedFromDate, selectedToDate]
	);

	const confirmDisabled = useMemo(
		() => queryToBe.length === 0 || selectedFromDate === null || selectedToDate === null,
		[queryToBe.length, selectedFromDate, selectedToDate]
	);

	const onConfirm = useCallback(() => {
		updateQuery(queryToBe);
		setDateStart(selectedFromDate?.getTime() ?? DEFAULT_DATE_START);
		setDateEnd(selectedToDate?.getTime() ?? DEFAULT_DATE_END);
		onClose();
	}, [updateQuery, queryToBe, setDateStart, selectedFromDate, setDateEnd, selectedToDate, onClose]);

	return (
		<CustomModal open={open} onClose={onClose} maxHeight="90vh" size="medium">
			<ModalHeader
				onClose={onClose}
				title={t('label.single_advanced_filter', 'Advanced Filters')}
				showCloseIcon
			/>
			<Divider />
			<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
				<KeywordRow otherKeywords={otherKeywords} setOtherKeywords={setOtherKeywords} />
				<FromDateToDateRow
					fromDate={selectedFromDate}
					setFromDate={setSelectedFromDate}
					toDate={selectedToDate}
					setToDate={setSelectedToDate}
				/>
			</Container>
			<Divider />
			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('action.search', 'Search')}
				confirmDisabled={confirmDisabled}
				secondaryActionLabel={t('action.reset', 'Reset filters')}
				onSecondaryAction={resetFilters}
				secondaryActionDisabled={secondaryDisabled}
			/>
		</CustomModal>
	);
};

export default AdvancedFilterModal;
