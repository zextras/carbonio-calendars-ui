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
	ModalFooter,
	ModalHeader,
	Padding,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { MultipleCalendarSelector } from './custom-components/multiple-calendar-selector';
import { GroupCalendarsList } from './group-calendars-list';
import { Folder } from '../../carbonio-ui-commons/types';
import { createCalendarGroupRequest } from '../../soap/create-calendar-group-request';
import { updateCalendarGroupsStore } from '../../store/zustand/calendar-group-store';

type CreateGroupModalProps = {
	onClose: () => void;
};

export const CreateGroupModal = ({ onClose }: CreateGroupModalProps): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [groupName, setGroupName] = useState(
		t('folder.modal.creategroup.default_group_name', 'New Calendar Group')
	);
	const [selectedCalendars, setSelectedCalendars] = useState<Array<Folder>>([]);

	const isDirty = useMemo(
		() => groupName !== '' || selectedCalendars.length > 0,
		[groupName, selectedCalendars]
	);

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
		if (!groupName) {
			return;
		}

		const ids = map(selectedCalendars, (item) => item.id);
		createCalendarGroupRequest({ name: groupName, calendarIds: ids })
			.then((res) => {
				const group = {
					id: res.group.id,
					name: res.group.name,
					calendarId: res.group.calendarId?.map((g) => g._content) ?? []
				};
				updateCalendarGroupsStore([group]);

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
	}, [createSnackbar, groupName, onClose, selectedCalendars, t]);

	const onCalendarRemove = useCallback((calendarId: string) => {
		setSelectedCalendars((prev) => prev.filter((item) => item.id !== calendarId));
	}, []);

	return (
		<Container
			style={{ overflowY: 'hidden' }}
			padding={{ all: 'small' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('folder.modal.creategroup.title', 'Create new Calendar Group')}
				showCloseIcon
				onClose={onClose}
			/>
			<Divider />
			<Padding vertical="small" />
			<Container
				maxHeight="fit"
				style={{ overflowY: 'hidden' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				<Input
					label={groupNameInputLabel}
					description={groupNameDescription}
					hasError={!isGroupNameValid}
					backgroundColor="gray5"
					value={groupName}
					onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
						setGroupName(e.target.value);
					}}
				/>
				<Padding top="small" />
				<Text size="extrasmall" color="gray1">
					{t('label.newgroup.note', 'This group will appear in your personal account.')}
				</Text>
				<Padding vertical="small" />
				<Divider />
				<Padding vertical="small" />
				<Container crossAlignment="flex-start">
					<Text weight="bold" size="large">
						{t('label.newgroup.calendars', 'Calendars in this group')}
					</Text>
				</Container>
				<Padding vertical="small" />
				<MultipleCalendarSelector onCalendarChange={onMultipleSelectedCalendarChange} />
				<Padding vertical="small" />
				<GroupCalendarsList calendars={selectedCalendars} onCalendarRemove={onCalendarRemove} />
				<Padding vertical="small" />
			</Container>
			<Divider />
			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('folder.modal.creategroup.footer', 'Create Group')}
				confirmDisabled={isConfirmDisabled}
			/>
		</Container>
	);
};
