/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Container,
	Divider,
	Input,
	Padding,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { MultiCalendarSelector } from './custom-components/multiple-calendar-selector';
import { GroupCalendarsList } from './group-calendars-list';
import { getCalendarGroups, useUpdateGroups } from '../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../carbonio-ui-commons/types';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { createCalendarGroupRequest } from '../../soap/create-calendar-group-request';

type CreateGroupModalProps = {
	onClose: () => void;
};

export const CreateGroupModal = ({ onClose }: CreateGroupModalProps): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const updateGroups = useUpdateGroups();
	const currentGroups = getCalendarGroups();
	const [groupName, setGroupName] = useState('');
	const [selectedCalendars, setSelectedCalendars] = useState<Array<Folder>>([]);

	const disabled = useMemo(
		() => groupName.indexOf('/') > -1 || groupName.length === 0,
		[groupName]
	);

	const onCloseModal = useCallback(() => {
		setGroupName('');
		onClose();
	}, [onClose]);

	const groupNameInputLabel = useMemo(() => t('label.type_group_name_here', 'Group Name'), [t]);

	const onMultipleSelectedCalendarChange = useCallback((selected: Array<Folder>) => {
		setSelectedCalendars((prev) => [...prev, ...selected]);
	}, []);

	const onConfirm = useCallback((): void => {
		if (!groupName) {
			return;
		}

		const ids = map(selectedCalendars, (item) => item.id);
		createCalendarGroupRequest({ name: groupName, calendarIds: ids })
			.then((res) => {
				updateGroups([
					...currentGroups,
					{
						id: res.group.id,
						name: res.group.name,
						calendarId: res.group.calendarId.map((g) => g._content)
					}
				]);

				createSnackbar({
					key: `group-creation-success`,
					replace: true,
					severity: 'success',
					label: t('message.snackbar.new_group_created', 'New group created'),
					autoHideTimeout: 3000,
					hideButton: true
				});

				onClose();
			})
			.catch(() => {
				createSnackbar({
					key: `group-creation-failed`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			});
	}, [createSnackbar, currentGroups, groupName, onClose, selectedCalendars, t, updateGroups]);

	const onCalendarRemove = useCallback((calendarId: string) => {
		setSelectedCalendars((prev) => prev.filter((item) => item.id !== calendarId));
	}, []);

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('folder.modal.creategroup.title', 'Create new Calendar Group')}
				onClose={onCloseModal}
			/>
			<Input
				label={groupNameInputLabel}
				backgroundColor="gray5"
				value={groupName}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					setGroupName(e.target.value);
				}}
			/>
			<Text size="extrasmall" color="gray1">
				{t('label.newgroup.note', 'This group will appear in your personal account.')}
			</Text>
			<Padding vertical="medium" />
			<Divider />
			<Padding vertical="medium" />
			<Text weight="bold" size="large">
				{t('label.newgroup.calendars', 'Calendars in this group')}
			</Text>
			<MultiCalendarSelector
				onCalendarChange={onMultipleSelectedCalendarChange}
				excludeTrash={false}
			/>

			<GroupCalendarsList calendars={selectedCalendars} onCalendarRemove={onCalendarRemove} />

			<ModalFooter
				onConfirm={onConfirm}
				label={t('folder.modal.creategroup.footer', 'Create Group')}
				disabled={disabled}
			/>
		</Container>
	);
};
