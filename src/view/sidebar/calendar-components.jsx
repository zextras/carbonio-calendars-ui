/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useMemo } from 'react';
import {
	AccordionItem,
	Button,
	Container,
	Dropdown,
	Icon,
	ModalManagerContext,
	Padding,
	Text,
	Tooltip
} from '@zextras/zapp-ui';
import { useDispatch } from 'react-redux';
import { getShareInfo } from '../../store/actions/get-share-info';
import { SharesModal } from './shares-modal';
import { useCalendarActions } from '../../hooks/use-calendar-actions';

export const SharesComponent = ({ item }) => {
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const onClick = useCallback(
		() =>
			dispatch(getShareInfo()).then((res) => {
				if (res.type.includes('fulfilled')) {
					const closeModal = createModal(
						{
							children: <SharesModal onClose={() => closeModal()} />
						},
						true
					);
				}
			}),
		[createModal, dispatch]
	);
	return (
		<Container
			width="fill"
			mainAlignment="center"
			orientation="horizontal"
			style={{ padding: '8px 16px' }}
		>
			<Button type="outlined" label={item.label} color="primary" size="fill" onClick={onClick} />
		</Container>
	);
};

export const FoldersComponent = ({ item }) => {
	const { name, checked, color, recursiveToggleCheck } = item;

	const ddItems = useCalendarActions(item);

	const icon = useMemo(() => {
		if (item.owner) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
		if (checked) return 'Calendar2';
		return 'CalendarOutline';
	}, [checked, item.owner]);

	return (
		<Dropdown items={ddItems} contextMenu width="100%" display="block">
			<AccordionItem item={item} onClick={recursiveToggleCheck} style={{ height: '40px' }}>
				<Padding right="small">
					<Icon icon={icon} customColor={color?.color} size="large" />
				</Padding>
				<Tooltip label={name} placement="right" maxWidth="100%">
					<Text style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}>{name}</Text>
				</Tooltip>
			</AccordionItem>
		</Dropdown>
	);
};
