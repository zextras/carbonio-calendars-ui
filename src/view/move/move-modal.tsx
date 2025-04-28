/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useState } from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import { FolderSelector } from '../../carbonio-ui-commons/components/select/flatten-folders/folder-selector';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { Folder } from '../../carbonio-ui-commons/types';
import { EventType } from '../../types/event';

type ActionArgs = {
	inviteId: string;
	l: string;
	id: string;
	destinationCalendarName: string;
};

type MoveModalProps = {
	toggleModal: () => void;
	onClose: () => void;
	event: EventType;
	currentFolder: Folder;
	action: (arg: ActionArgs) => void;
};

export const MoveModal = ({
	toggleModal,
	onClose,
	event,
	currentFolder,
	action
}: MoveModalProps): ReactElement => {
	const [folderDestination, setFolderDestination] = useState<Folder | undefined>();
	const [isSameFolder, setIsSameFolder] = useState(false);
	const onConfirm = useCallback(() => {
		if (folderDestination && folderDestination?.id !== currentFolder.id) {
			action({
				inviteId: event.resource.inviteId,
				l: folderDestination.id,
				id: event.resource.id,
				destinationCalendarName: folderDestination.name
			});
			onClose();
		} else {
			setIsSameFolder(true);
		}
	}, [
		folderDestination,
		currentFolder.id,
		action,
		event.resource.inviteId,
		event.resource.id,
		onClose
	]);

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={`${
					event.resource.calendar.id === FOLDERS.TRASH
						? t('label.restore', 'Restore')
						: t('label.move', 'Move')
				} ${event.title}`}
				onClose={onClose}
			/>
			<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
				<Container
					padding={{ vertical: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
				>
					<Text overflow="break-word">
						{t(
							'folder.modal.move.body.message3',
							'Select a calendar to move the considered appointment to:'
						)}
					</Text>
				</Container>
				<FolderSelector
					onFolderSelected={(folder: Folder): void => {
						setFolderDestination(folder);
					}}
					showSharedAccounts
					allowRootSelection
				/>

				<Container padding={{ all: 'medium' }} mainAlignment="center" crossAlignment="flex-start">
					{isSameFolder && <Text color="error">Cannot move to same folder</Text>}
				</Container>
				<ModalFooter
					onConfirm={onConfirm}
					secondaryAction={toggleModal}
					secondaryBtnType="outlined"
					secondaryColor="primary"
					secondaryLabel={t('label.new_calendar', 'New Calendar')}
					label={
						event.resource.calendar.id === FOLDERS.TRASH
							? t('label.restore', 'Restore')
							: t('label.move', 'Move')
					}
					disabled={
						folderDestination &&
						(!folderDestination.id || folderDestination.id === currentFolder.id)
					}
				/>
			</Container>
		</Container>
	);
};
