/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useState } from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	ModalFooter,
	ModalHeader,
	FolderSelector,
	isTrash,
	Folder
} from '@zextras/carbonio-ui-commons';

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

	const onConfirm = useCallback(() => {
		if (folderDestination && folderDestination?.id !== currentFolder.id) {
			action({
				inviteId: event.resource.inviteId,
				l: folderDestination.id,
				id: event.resource.id,
				destinationCalendarName: folderDestination.name
			});
			onClose();
		}
	}, [
		folderDestination,
		currentFolder.id,
		action,
		event.resource.inviteId,
		event.resource.id,
		onClose
	]);

	const isInvalidDestination = !folderDestination || !folderDestination.id;
	const isInvalidCurrent = !currentFolder || !currentFolder.id;
	const isSameFolder = folderDestination?.id === currentFolder?.id;

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
			width="fill"
			style={{
				maxWidth: '100%',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				minHeight: 0
			}}
		>
			<ModalHeader
				title={`${
					isTrash(event.resource.calendar.id)
						? t('label.restore', 'Restore')
						: t('label.move', 'Move')
				} ${event.title}`}
				onClose={onClose}
			/>

			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="fit"
				width="fill"
				padding={{ bottom: 'small' }}
				style={{
					flex: 1,
					minHeight: 0,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column'
				}}
			>
				<Container
					padding={{ vertical: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					width="fill"
				>
					<Text overflow="break-word">
						{t(
							'folder.modal.move.body.message3',
							'Select a calendar to move the considered appointment to:'
						)}
					</Text>
				</Container>

				<Container
					width="fill"
					padding={{ bottom: 'small' }}
					style={{
						flex: 1,
						minHeight: 0,
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					<FolderSelector
						selectedFolderId={folderDestination?.id}
						onFolderSelected={(folder: Folder): void => {
							setFolderDestination(folder);
						}}
						showSharedAccounts
						allowRootSelection={false}
						filterChildren={(folder: Folder): boolean => !isTrash(folder.id)}
					/>
				</Container>
			</Container>

			<ModalFooter
				onConfirm={onConfirm}
				secondaryAction={toggleModal}
				secondaryBtnType="outlined"
				secondaryColor="primary"
				secondaryLabel={t('label.new_calendar', 'New Calendar')}
				label={
					isTrash(event.resource.calendar.id)
						? t('label.restore', 'Restore')
						: t('label.move', 'Move')
				}
				disabled={isInvalidDestination || isInvalidCurrent || isSameFolder}
			/>
		</Container>
	);
};
