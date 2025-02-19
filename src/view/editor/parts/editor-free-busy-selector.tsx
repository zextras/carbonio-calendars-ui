/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
	AnyColor,
	Icon,
	type LabelFactoryProps,
	Padding,
	Row,
	Select,
	type SelectItem,
	SingleSelectionOnChange,
	useTheme
} from '@zextras/carbonio-design-system';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ColorContainer, LabelText, TextUpperCase } from './select-label-factory';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorCalendar,
	selectEditorDisabled,
	selectEditorFreeBusy
} from '../../../store/selectors/editor';
import { editEditorDisplayStatus } from '../../../store/slices/editor-slice';
import { InviteFreeBusy } from '../../../types/store/invite';

interface CustomSelectItem extends SelectItem {
	backgroundColor: string;
	borderColor: string;
}

export interface CustomLabelFactoryProps extends LabelFactoryProps {
	selected: CustomSelectItem[];
}

const FreeBusyIconItem = styled.div<{ color?: AnyColor; border?: AnyColor }>`
	width: 1rem;
	height: 1rem;
	background: ${({ color }): string | undefined => color};
	border: ${({ border }): string | undefined => `1px solid ${border}`};
	border-radius: 0.25rem;
`;

const FreeBusyItemFactory = ({
	backgroundColor,
	borderColor,
	label
}: {
	backgroundColor: string | undefined;
	borderColor: string | undefined;
	label: string;
}): React.JSX.Element => (
	<Row wrap={'nowrap'}>
		<Padding right="small">
			<FreeBusyIconItem color={backgroundColor} border={borderColor} />
		</Padding>
		<TextUpperCase>{label}</TextUpperCase>
	</Row>
);

const FreeBusyLabelFactory = (item: CustomLabelFactoryProps): React.JSX.Element => {
	const { selected, label, open, focus, disabled } = item;
	return (
		<ColorContainer
			orientation="horizontal"
			width="fill"
			crossAlignment="center"
			mainAlignment="space-between"
			borderRadius="half"
			padding={{
				all: 'small'
			}}
			background={'gray5'}
			style={{ cursor: disabled ? 'no-drop' : 'pointer' }}
		>
			<Row width="100%" takeAvailableSpace mainAlignment="space-between">
				<Row
					orientation="vertical"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					padding={{ left: 'small' }}
				>
					<LabelText size="small" disabled={disabled} $showPrimary={open || focus}>
						{label}
					</LabelText>
					{selected?.[0] && (
						<FreeBusyItemFactory
							backgroundColor={selected[0].backgroundColor}
							label={selected[0].label}
							borderColor={selected[0].borderColor}
						/>
					)}
				</Row>
			</Row>
			<Icon
				size="large"
				icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
				disabled={disabled}
				style={{ alignSelf: 'center' }}
				color={(disabled && 'text') || ((open || focus) && 'primary') || 'secondary'}
			/>
		</ColorContainer>
	);
};

const STATUS_VALUES = {
	FREE: 'F',
	TENTATIVE: 'T',
	BUSY: 'B',
	OUT_OF_OFFICE: 'O'
};

const useGetStatusItems = (editorId: string): Array<any> => {
	const [t] = useTranslation();
	const calendar = useAppSelector(selectEditorCalendar(editorId));
	const calendarColor = setCalendarColor({ color: calendar.color }).color;
	const backgroundColor = setCalendarColor({ color: calendar.color }).background;
	const theme = useTheme();
	const tentativeBackgroundGradient = `repeating-linear-gradient(45deg,
				${calendarColor},
				${calendarColor} 3px,
				${backgroundColor},
				${backgroundColor} 5px)`;

	return useMemo(
		() => [
			{
				label: t('label.free', 'Free'),
				value: STATUS_VALUES.FREE,
				backgroundColor: theme.palette.white.regular,
				borderColor: calendarColor,
				customComponent: (
					<FreeBusyItemFactory
						backgroundColor={theme.palette.white.regular}
						borderColor={calendarColor}
						label={t('label.free', 'Free')}
					/>
				)
			},
			{
				label: t('label.tentative', 'Tentative'),
				value: STATUS_VALUES.TENTATIVE,
				backgroundColor: tentativeBackgroundGradient,
				borderColor: calendarColor,
				customComponent: (
					<FreeBusyItemFactory
						backgroundColor={tentativeBackgroundGradient}
						borderColor={calendarColor}
						label={t('label.tentative', 'Tentative')}
					/>
				)
			},
			{
				label: t('label.busy', 'Busy'),
				value: STATUS_VALUES.BUSY,
				backgroundColor: calendarColor,
				borderColor: calendarColor,
				customComponent: (
					<FreeBusyItemFactory
						backgroundColor={calendarColor}
						borderColor={calendarColor}
						label={t('label.busy', 'Busy')}
					/>
				)
			},
			{
				label: t('label.out_of_office', 'Out of office'),
				value: STATUS_VALUES.OUT_OF_OFFICE,
				borderColor: calendarColor,
				backgroundColor: theme.palette.gray2.regular,
				customComponent: (
					<FreeBusyItemFactory
						backgroundColor={theme.palette.gray2.regular}
						borderColor={calendarColor}
						label={t('label.out_of_office', 'Out of office')}
					/>
				)
			}
		],
		[
			calendarColor,
			t,
			tentativeBackgroundGradient,
			theme.palette.gray2.regular,
			theme.palette.white.regular
		]
	);
};

export const EditorFreeBusySelector = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const statusItems = useGetStatusItems(editorId);
	const freeBusy = useAppSelector(selectEditorFreeBusy(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const getNewSelection = useCallback(
		(e: InviteFreeBusy | undefined) => find(statusItems, ['value', e]) ?? statusItems[0],
		[statusItems]
	);

	const [selected, setSelected] = useState(getNewSelection(freeBusy));

	const onChange = useCallback<SingleSelectionOnChange<InviteFreeBusy>>(
		(value) => {
			if (value) {
				dispatch(editEditorDisplayStatus({ id: editorId, freeBusy: value }));
				setSelected(getNewSelection(value));
			}
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
			background={'gray5'}
			label={t('label.display', 'Display')}
			onChange={onChange}
			selection={selected}
			disabled={disabled?.freeBusy}
			LabelFactory={FreeBusyLabelFactory}
		/>
	) : null;
};
