/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import React, { useState, useMemo, useCallback, ReactElement } from 'react';
import { Input, Container, Text, AccordionItemType } from '@zextras/carbonio-design-system';
import { filter, startsWith, reduce, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ModalHeader } from '../../commons/modal-header';
import ModalFooter from '../../commons/modal-footer';
import { getFolderTranslatedName } from '../../commons/utilities';
import { ZimbraColorType } from '../../commons/zimbra-standard-colors';
import { selectCalendars } from '../../store/selectors/calendars';
import { EventType } from '../../types/event';
import { Calendar } from '../../types/store/calendars';
import { FolderItem } from './folder-item';

type ActionArgs = {
	inviteId: string;
	t: TFunction;
	l: string;
	color: ZimbraColorType;
	id: string;
	destinationCalendarName: string;
};

type MoveModalProps = {
	toggleModal: () => void;
	onClose: () => void;
	event: EventType;
	currentFolder: Calendar;
	action: (arg: ActionArgs) => void;
};

export const MoveModal = ({
	toggleModal,
	onClose,
	event,
	currentFolder,
	action
}: MoveModalProps): ReactElement => {
	const [t] = useTranslation();

	const folders = useSelector(selectCalendars);
	const [input, setInput] = useState('');
	const [folderDestination, setFolderDestination] = useState<Calendar>({} as Calendar);
	const [isSameFolder, setIsSameFolder] = useState(false);
	const onConfirm = useCallback(() => {
		if (folderDestination?.id !== currentFolder.id) {
			action({
				inviteId: event.resource.inviteId,
				t,
				l: folderDestination.id,
				color: folderDestination.color,
				id: event.resource.id,
				destinationCalendarName: folderDestination.name
			});
			onClose();
		} else {
			setIsSameFolder(true);
		}
	}, [
		folderDestination.id,
		folderDestination.color,
		folderDestination.name,
		currentFolder.id,
		action,
		event.resource.inviteId,
		event.resource.id,
		t,
		onClose
	]);
	const filterFromInput = useMemo<Calendar[]>(
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
								...item,
								label: item.name,
								items: folders,
								onClick: () => setFolderDestination(item),
								open: !!input.length,
								divider: true,
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
		() => [
			{
				id: FOLDERS.USER_ROOT,
				label: getFolderTranslatedName(FOLDERS.USER_ROOT, 'Root'),
				level: 0,
				open: true,
				items: nestFilteredFolders(folders, '1', filterFromInput),
				background: folderDestination.id === '1' ? 'highlight' : undefined
			} as AccordionItemType
		],
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
