/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
	Container,
	Accordion,
	AccordionItem,
	Checkbox,
	Padding,
	Text,
	Input,
	Icon,
	Row
} from '@zextras/carbonio-design-system';
import {
	groupBy,
	map,
	isEmpty,
	split,
	last,
	values,
	uniqWith,
	isEqual,
	filter,
	pickBy,
	startsWith,
	toLower
} from 'lodash';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { ModalHeader } from '../../commons/modal-header';
import ModalFooter from '../../commons/modal-footer';
import { createMountpoint } from '../../store/actions/create-mountpoint';
import { getFolderTranslatedName } from '../../commons/utilities';

const ContainerEl = styled(Container)`
	overflow-y: auto;
	display: block;
`;

const CustomItem = ({ item }) => {
	const [checked, setChecked] = useState(false);
	const [t] = useTranslation();

	const onClick = useCallback(() => {
		if (!checked) {
			item.setLinks(
				uniqWith(
					[
						...item.links,
						{
							id: item.id,
							name: item.label,
							folderId: item.folderId,
							ownerId: item.ownerId,
							ownerName: item.ownerName,
							of: t('label.of', 'of')
						}
					],
					isEqual
				)
			);
		} else {
			item.setLinks(filter(item.links, (v) => v.id !== item.id));
		}
		setChecked(!checked);
	}, [checked, item, t]);

	return (
		<>
			<Padding>
				<Checkbox value={checked} onClick={onClick} iconColor="primary" />
			</Padding>
			<AccordionItem item={item} />
		</>
	);
};

export const SharesModal = ({ calendars, onClose }) => {
	const [links, setLinks] = useState([]);
	const [data, setData] = useState();
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const onConfirm = useCallback(() => {
		dispatch(createMountpoint(links));
		onClose();
	}, [dispatch, links, onClose]);

	const shared = map(calendars, (c) => ({
		id: `${c.ownerName} - ${c.folderId} - ${c.granteeType} - ${c.granteeName}`,
		label: getFolderTranslatedName(t, c.folderId, last(split(c.folderPath, '/'))),
		open: true,
		items: [],
		ownerName: c.ownerName,
		ownerId: c.ownerId,
		checked: false,
		folderId: c.folderId,
		setLinks,
		links,
		CustomComponent: CustomItem
	}));
	const filteredFolders = useMemo(() => groupBy(shared, 'ownerName'), [shared]);
	const nestedData = useMemo(
		() => [
			{
				id: FOLDERS.USER_ROOT,
				label: getFolderTranslatedName(t, FOLDERS.USER_ROOT, 'Root'),
				level: '0',
				open: true,
				items: map(values(data ?? filteredFolders), (v) => ({
					id: v[0].ownerId,
					label: (
						<Trans
							i18nKey="label.shares_items"
							defaults="<bold>{{user}}</bold>'s shared calendars"
							values={{ user: v[0].ownerName }}
							components={{
								bold: (
									<span
										style={{ fontWeight: 'bold', fontFamily: 'sans-serif', fontSize: '14px' }}
									/>
								)
							}}
						/>
					),
					open: true,
					items: v,
					divider: true,
					background: undefined
				})),
				background: undefined,
				onClick: () => null
			}
		],
		[t, data, filteredFolders]
	);

	const filterResults = useCallback(
		(ev) => {
			setData(
				pickBy(filteredFolders, (value, key) =>
					startsWith(toLower(key), toLower(ev?.target?.value))
				)
			);
		},
		[filteredFolders]
	);

	return isEmpty(nestedData) ? (
		<>No shared folders to show at the moment</>
	) : (
		<>
			<ModalHeader title={t('find_calendar_shares', 'Find Calendar Shares')} onClose={onClose} />
			<Row padding={{ top: 'large', bottom: 'small' }} width="fill" mainAlignment="flex-start">
				<Text>
					{t('label.find_shares', 'Select which calendars you want to see in calendars tree')}
				</Text>
			</Row>
			<Row padding={{ top: 'small', bottom: 'large' }} width="fill">
				<Input
					label={t('label.filter_sharer_user', 'Foder owner')}
					backgroundColor="gray5"
					CustomIcon={({ hasFocus }) => (
						<Icon icon="FunnelOutline" size="large" color={hasFocus ? 'primary' : 'text'} />
					)}
					onChange={filterResults}
				/>
			</Row>
			<ContainerEl orientation="vertical" mainAlignment="flex-start" maxHeight="40vh">
				<Accordion items={nestedData} background="gray6" />
			</ContainerEl>
			<Row padding="small" width="fill" mainAlignment="flex-end">
				<ModalFooter onConfirm={onConfirm} label={t('add', 'Add')} disabled={links?.length <= 0} />
			</Row>
		</>
	);
};
