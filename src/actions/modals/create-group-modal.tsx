/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { getErrorMessage, Folder } from '@zextras/carbonio-ui-commons';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { GroupCalendarsList } from './components/group-calendars-list';
import { MultipleCalendarSelector } from './components/multiple-calendar-selector';
import { createCalendarGroupRequest } from '../../soap/create-calendar-group-request';
import { updateCalendarGroupsStore } from '../../store/zustand/calendar-group-store';

type CreateGroupModalProps = {
	onClose: () => void;
};

export const CreateGroupModal = ({ onClose }: CreateGroupModalProps): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [groupName, setGroupName] = useState('');
	const [selectedCalendars, setSelectedCalendars] = useState<Array<Folder>>([]);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const selectedCalendarsIds = useMemo(
		() => map(selectedCalendars, (item) => item.id),
		[selectedCalendars]
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

	const groupNameInputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		groupNameInputRef.current?.focus();
	}, []);

	const groupNameDescription = useMemo(() => {
		if (isDirty) {
			if (!groupName.length) {
				return t('label.empty_group_name', 'Type a group name to save changes');
			}

			if (!isGroupNameValid) {
				return t(
					'label.invalid_group_name',
					'This group name is invalid. Please avoid using special characters'
				);
			}
		}

		return t('label.newgroup.note', 'This group will appear in your personal account.');
	}, [isDirty, isGroupNameValid, groupName, t]);

	const hasError = isDirty && !isGroupNameValid;

	const onMultipleSelectedCalendarChange = useCallback((selected: Folder) => {
		setSelectedCalendars((prev) => [selected, ...prev]);
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
			.catch((err) => {
				createSnackbar({
					key: `group-creation-failed`,
					replace: true,
					severity: 'error',
					label: getErrorMessage(err, t),
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
					hasError={hasError}
					background="gray5"
					value={groupName}
					onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
						if (!isDirty) setIsDirty(true);
						setGroupName(e.target.value);
					}}
					inputRef={groupNameInputRef}
				/>
				<Padding vertical="small" />
				<Divider />
				<Padding vertical="small" />
				<Container crossAlignment="flex-start">
					<Text weight="bold" size="small">
						{t('label.newgroup.calendars', 'Calendars in this group')}
					</Text>
				</Container>
				<Padding vertical="small" />
				<MultipleCalendarSelector
					onCalendarChange={onMultipleSelectedCalendarChange}
					excludedCalendarsIds={selectedCalendarsIds}
				/>
				<Padding vertical="small" />
				<GroupCalendarsList calendars={selectedCalendars} onCalendarRemove={onCalendarRemove} />
				<Padding vertical="small" />
			</Container>
			<Divider />
			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('folder.modal.creategroup.footer', 'Create Group')}
				confirmDisabled={isConfirmDisabled}
				confirmTooltip={
					isConfirmDisabled
						? t(
								'folder.modal.create_calendar_group.disabled_tooltip',
								'Please fill in all required field correctly.'
							)
						: undefined
				}
			/>
		</Container>
	);
};
