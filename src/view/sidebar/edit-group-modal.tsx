/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState, FC, useEffect } from 'react';

import {
	Container,
	Divider,
	Input,
	ModalFooter,
	ModalHeader,
	Padding,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { MultiCalendarSelector } from './custom-components/multiple-calendar-selector';
import { GroupCalendarsList } from './group-calendars-list';
import { useFoldersMap } from '../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../carbonio-ui-commons/types';
import { modifyCalendarGroupRequest } from '../../soap/modify-calendar-group-request';
import { updateCalendarGroupsStore, useGroupById } from '../../store/zustand/calendar-group-store';

export type EditGroupModalProps = {
	groupId: string;
	onClose: () => void;
};

export const EditGroupModal: FC<EditGroupModalProps> = ({
	groupId,
	onClose
}: EditGroupModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const folders = useFoldersMap();
	const group = useGroupById(groupId);
	const [groupName, setGroupName] = useState(group?.name ?? '');
	const groupCalendars = useMemo(() => {
		if (!group) {
			return [];
		}

		return group.calendarId.map((id) => folders[id]);
	}, [folders, group]);
	const [selectedCalendars, setSelectedCalendars] = useState<Array<Folder>>(groupCalendars);

	const isDirty = useMemo(() => {
		if (!group) {
			return false;
		}

		return (
			groupName !== group.name ||
			selectedCalendars.length !== group.calendarId.length ||
			selectedCalendars.some((item) => !group.calendarId.includes(item.id))
		);
	}, [group, groupName, selectedCalendars]);

	const isGroupNameValid = useMemo(
		() => groupName.indexOf('/') === -1 && groupName.length > 0,
		[groupName]
	);

	const isConfirmDisabled = useMemo(
		() => !isGroupNameValid || !isDirty,
		[isGroupNameValid, isDirty]
	);

	const groupNameInputLabel = useMemo(
		() => `${t('label.type_group_name_here', 'Group Name')}*`,
		[t]
	);

	const groupNameDescription = useMemo(
		() =>
			isGroupNameValid ? '' : t('label.invalid_group_name', 'Type a group name to save changes'),
		[isGroupNameValid, t]
	);

	const onMultipleSelectedCalendarChange = useCallback((selected: Array<Folder>) => {
		setSelectedCalendars((prev) => [...prev, ...selected]);
	}, []);

	const onConfirm = useCallback((): void => {
		if (!group) {
			return;
		}

		const ids = map(selectedCalendars, (item) => item.id);
		modifyCalendarGroupRequest({ id: group.id, name: groupName, calendarIds: ids })
			.then((res) => {
				const group = {
					id: res.group.id,
					name: res.group.name,
					calendarId: res.group.calendarId.map((g) => g._content)
				};
				updateCalendarGroupsStore([group]);

				createSnackbar({
					key: `group-editing-success`,
					replace: true,
					severity: 'success',
					label: t('message.snackbar.group_edited', 'Changes saved'),
					autoHideTimeout: 3000,
					hideButton: true
				});

				onClose();
			})
			.catch(() => {
				createSnackbar({
					key: `group-editing-failed`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			});
	}, [createSnackbar, group, groupName, onClose, selectedCalendars, t]);

	const onCalendarRemove = useCallback((calendarId: string) => {
		setSelectedCalendars((prev) => prev.filter((item) => item.id !== calendarId));
	}, []);

	useEffect(() => {
		if (!group) {
			createSnackbar({
				key: `group-not-found`,
				replace: true,
				severity: 'error',
				label: t('label.group_not_found', 'Group not found'),
				autoHideTimeout: 3000,
				hideButton: true
			});
			onClose();
		}
	}, [createSnackbar, group, onClose, t]);

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('folder.modal.editgroup.title', 'Edit Calendar Group')}
				showCloseIcon
				onClose={onClose}
			/>
			<Input
				label={groupNameInputLabel}
				backgroundColor="gray5"
				value={groupName}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					setGroupName(e.target.value);
				}}
				hasError={!isGroupNameValid}
				description={groupNameDescription}
			/>
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
				confirmLabel={t('folder.modal.editgroup.footer', 'Save changes')}
				confirmDisabled={isConfirmDisabled}
			/>
		</Container>
	);
};
