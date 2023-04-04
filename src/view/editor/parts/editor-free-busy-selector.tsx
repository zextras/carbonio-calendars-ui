/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Select, Text } from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { selectEditorDisabled, selectEditorFreeBusy } from '../../../store/selectors/editor';
import { editEditorDisplayStatus } from '../../../store/slices/editor-slice';
import LabelFactory, { Square } from './select-label-factory';

type EditorFreeBusyProps = {
	editorId: string;
};

type ItemProps = {
	label: string;
	color: string;
};

const StatusItemComponent = ({ label, color }: ItemProps): ReactElement => (
	<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
		<Square color={color} />
		<Padding left="small">
			<Text>{label}</Text>
		</Padding>
	</Container>
);

const STATUS_VALUES = {
	FREE: 'F',
	TENTATIVE: 'T',
	BUSY: 'B',
	OUT_OF_OFFICE: 'O'
};

const getStatusItems = (t: TFunction): Array<any> => [
	{
		label: t('label.free', 'Free'),
		value: STATUS_VALUES.FREE,
		color: '#ffffff',
		customComponent: <StatusItemComponent label={t('label.free', 'Free')} color="#ffffff" />
	},
	{
		label: t('label.tentative', 'tentative'),
		value: STATUS_VALUES.TENTATIVE,
		color: '#ffc107',
		customComponent: (
			<StatusItemComponent label={t('label.tentative', 'tentative')} color="#ffc107" />
		)
	},
	{
		label: t('label.busy', 'Busy'),
		value: STATUS_VALUES.BUSY,
		color: '#d5e3f6',
		customComponent: <StatusItemComponent label={t('label.busy', 'Busy')} color="#d5e3f6" />
	},
	{
		label: t('label.out_of_office', 'Out of office'),
		value: STATUS_VALUES.OUT_OF_OFFICE,
		color: '#d5e3f6',
		customComponent: (
			<StatusItemComponent label={t('label.out_of_office', 'Out of office')} color="#2b73d2" />
		)
	}
];

export const EditorFreeBusySelector = ({ editorId }: EditorFreeBusyProps): ReactElement | null => {
	const [t] = useTranslation();
	const statusItems = useMemo(() => getStatusItems(t), [t]);
	const freeBusy = useSelector(selectEditorFreeBusy(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

	const getNewSelection = useCallback(
		(e) => find(statusItems, ['value', e]) ?? statusItems[0],
		[statusItems]
	);

	const [selected, setSelected] = useState(getNewSelection(freeBusy));

	const onChange = useCallback(
		(value) => {
			dispatch(editEditorDisplayStatus({ id: editorId, freeBusy: value }));
			setSelected(getNewSelection(value));
		},
		[dispatch, editorId, getNewSelection]
	);

	useEffect(() => {
		if (freeBusy) {
			setSelected(getNewSelection(freeBusy));
		}
	}, [freeBusy, getNewSelection]);

	return selected ? (
		<Select
			items={statusItems}
			background="gray5"
			label={t('label.display', 'Display')}
			onChange={onChange}
			selection={selected}
			disabled={disabled?.freeBusy}
			LabelFactory={LabelFactory}
		/>
	) : null;
};
