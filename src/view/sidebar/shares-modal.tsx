/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Accordion,
	AccordionItem,
	Checkbox,
	Container,
	Icon,
	Input,
	Row,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';
import {
	filter,
	groupBy,
	isEmpty,
	isEqual,
	last,
	map,
	pickBy,
	split,
	startsWith,
	toLower,
	uniqWith,
	values
} from 'lodash';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import { SidebarCustomItem } from '../../carbonio-ui-commons/types/sidebar';
import { ResFolder } from '../../carbonio-ui-commons/utils';
import { getFolderTranslatedName } from '../../commons/utilities';
import { createMountpoint } from '../../store/actions/create-mountpoint';
import { useAppDispatch } from '../../store/redux/hooks';

const ContainerEl = styled(Container)`
	overflow-y: auto;
	display: block;
`;

const CustomItem: FC<SidebarCustomItem> = ({ item }) => {
	const [checked, setChecked] = useState(false);

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
	}, [checked, item]);

	return (
		<>
			<Checkbox value={checked} onClick={onClick} iconColor="primary" />
			<AccordionItem item={item} />
		</>
	);
};

export const SharesModal: FC<{ calendars: ResFolder[]; onClose: () => void }> = ({
	calendars,
	onClose
}) => {
	const [links, setLinks] = useState([]);
	const [data, setData] = useState<any>();
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();
	const onConfirm = useCallback(() => {
		dispatch(createMountpoint(links)).then(({ payload }) => {
			if (payload.CreateMountpointResponse && !payload.Fault) {
				createSnackbar({
					key: `mountpoint`,
					replace: true,
					type: 'success',
					label: t(
						'mountpoint_success',
						'The share has been added successfully to the Shared Calendars section'
					),
					autoHideTimeout: 3000
				});
			}
			if (payload.CreateMountpointResponse && payload.Fault) {
				const failsLength = payload?.Fault?.length;
				const totalLength = failsLength + payload.CreateMountpointResponse.length;
				createSnackbar({
					key: `mountpoint`,
					replace: true,
					type: 'warning',
					label: t('mountpoint_warning', {
						failed: failsLength,
						total: totalLength,
						defaultValue:
							"{{failed}} out of {{total}} shared calendars couldn't be added to the Shared Calendars"
					}),
					autoHideTimeout: 3000
				});
			}
			if (!payload.CreateMountpointResponse && payload.Fault) {
				createSnackbar({
					key: `mountpoint`,
					replace: true,
					type: 'error',
					label: t(
						'mountpoint_error',
						"The share couldn't be added to the Shared Calendars section"
					),
					autoHideTimeout: 3000
				});
			}
		});
		onClose();
	}, [createSnackbar, dispatch, links, onClose]);

	const shared = map(calendars, (calendar) => ({
		id: `${calendar?.ownerName} - ${calendar.folderId} - ${calendar.granteeType} - ${calendar.granteeName}`,
		label: getFolderTranslatedName({
			folderId: calendar.folderId ?? '',
			folderName: last(split(calendar.folderPath, '/')) ?? ''
		}),
		open: true,
		items: [],
		ownerName: calendar.ownerName,
		ownerId: calendar.ownerId,
		checked: false,
		folderId: calendar.folderId,
		setLinks,
		links,
		CustomComponent: CustomItem
	}));

	const filteredFolders = useMemo(() => groupBy(shared, 'ownerName'), [shared]);

	const nestedData = useMemo(
		() => [
			{
				id: FOLDERS.USER_ROOT,
				label: getFolderTranslatedName({ folderId: FOLDERS.USER_ROOT, folderName: 'Root' }),
				level: 0,
				open: true,
				items: map(values(data ?? filteredFolders), (value) => ({
					id: value[0].ownerId,
					label: (
						<Trans
							i18nKey="label.shares_items"
							defaults="<bold>{{user}}</bold>'s shared calendars"
							values={{ user: value[0].ownerName }}
							components={{
								bold: (
									<span
										style={{ fontWeight: 'bold', fontFamily: 'sans-serif', fontSize: '0.875rem' }}
									/>
								)
							}}
						/>
					) as unknown as string,
					open: true,
					items: value,
					background: undefined
				})),
				background: undefined,
				onClick: () => null
			}
		],
		[data, filteredFolders]
	);

	const filterResults = useCallback(
		(ev: React.ChangeEvent<HTMLInputElement>): void => {
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
					CustomIcon={({ hasFocus }): ReactElement => (
						<Icon icon="FunnelOutline" size="large" color={hasFocus ? 'primary' : 'text'} />
					)}
					onChange={filterResults}
				/>
			</Row>
			<ContainerEl orientation="vertical" mainAlignment="flex-start" maxHeight="40vh">
				<Accordion items={nestedData} background={'gray6'} />
			</ContainerEl>
			<Row padding="small" width="fill" mainAlignment="flex-end">
				<ModalFooter onConfirm={onConfirm} label={t('add', 'Add')} disabled={links?.length <= 0} />
			</Row>
		</>
	);
};
