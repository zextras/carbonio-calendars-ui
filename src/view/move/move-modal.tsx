/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { AccordionItemType, Container, Input, Text } from '@zextras/carbonio-design-system';
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';
import { filter, isEmpty, reduce, startsWith } from 'lodash';

import { FolderItem } from './folder-item';
import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import { useFoldersMap } from '../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { getFolderTranslatedName } from '../../commons/utilities';
import { EventType } from '../../types/event';
import { Calendar } from '../../types/store/calendars';

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
	const folders = useFoldersMap();
	const [input, setInput] = useState('');
	const [folderDestination, setFolderDestination] = useState<Calendar>({} as Calendar);
	const [isSameFolder, setIsSameFolder] = useState(false);
	const onConfirm = useCallback(() => {
		if (folderDestination?.id !== currentFolder.id) {
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
		folderDestination.id,
		folderDestination.name,
		currentFolder.id,
		action,
		event.resource.inviteId,
		event.resource.id,
		onClose
	]);
	const filterFromInput = useMemo<Array<Folder>>(
		() =>
			filter(folders, (v) => {
				if (isEmpty(v)) {
					return false;
				}
				if (v.id === currentFolder.id) {
					return false;
				}
				return startsWith(v.name?.toLowerCase(), input?.toLowerCase());
			}),
		[currentFolder, folders, input]
	);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const nestFilteredFolders = useCallback(
		(items: Calendar[], calId, results: Calendar[]) =>
			reduce(
				filter(items, (item) => item.parent === calId),
				(acc, item) => {
					const match = filter(results, (result) => result.id === item.id);
					if (match && match.length) {
						return [
							...acc,
							{
								divider: true
							},
							{
								...item,
								label: item.name,
								items: folders,
								onClick: () => setFolderDestination(item),
								open: !!input.length,
								background: folderDestination.id === item.id ? 'highlight' : undefined
							}
						];
					}
					if (match && !match.length) {
						return [...acc, ...nestFilteredFolders(items, item.id, results)];
					}
					return acc;
				},
				[] as Calendar[]
			),
		[folderDestination.id, input.length, folders]
	);

	const nestedData = useMemo(
		() =>
			[
				{
					id: FOLDERS.USER_ROOT,
					label: getFolderTranslatedName({ folderId: FOLDERS.USER_ROOT, folderName: 'Root' }),
					level: 0,
					open: true,
					items: nestFilteredFolders(folders, '1', filterFromInput),
					background: folderDestination.id === '1' ? 'highlight' : undefined
				}
			] as AccordionItemType[],
		[filterFromInput, folderDestination.id, folders, nestFilteredFolders]
	);

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
				<Input
					label={t('folder.modal.move.input.filter', 'Filter calendars')}
					backgroundColor="gray5"
					value={input}
					onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
						if (e) {
							setInput(e?.target?.value);
						}
					}}
				/>

				<FolderItem folders={nestedData} />
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
					disabled={!folderDestination.id || folderDestination.id === currentFolder.id}
				/>
			</Container>
		</Container>
	);
};
