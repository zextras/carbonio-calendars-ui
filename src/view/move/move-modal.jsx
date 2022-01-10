/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Input, Container, Text } from '@zextras/zapp-ui';
import { filter, startsWith, reduce, isEmpty } from 'lodash';
import { ModalHeader } from '../../commons/modal-header';
import ModalFooter from '../../commons/modal-footer';
import FolderItem from './folder-item';

export default function MoveModal({
	toggleModal,
	onClose,
	event,
	currentFolder,
	folders,
	t,
	action
}) {
	const { inviteId, ridZ } = event.resource;
	const [input, setInput] = useState('');
	const [folderDestination, setFolderDestination] = useState({});
	const [isSameFolder, setIsSameFolder] = useState(false);
	const onConfirm = useCallback(() => {
		if (folderDestination?.id !== currentFolder.id) {
			action({
				inviteId,
				ridZ,
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
		folderDestination.name,
		folderDestination.color,
		currentFolder.id,
		action,
		inviteId,
		ridZ,
		t,
		event.resource.id,
		onClose
	]);
	const filterFromInput = useMemo(
		() =>
			filter(folders, (v) => {
				if (isEmpty(v)) {
					return false;
				}
				if (v.id === currentFolder[0].id) {
					return false;
				}
				return startsWith(v.name?.toLowerCase(), input?.toLowerCase());
			}),
		[currentFolder, folders, input]
	);
	const nestFilteredFolders = useCallback(
		(items, id, results) =>
			reduce(
				filter(items, (item) => item.parent === id),
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
				[]
			),
		[folderDestination.id, input.length, folders]
	);
	const nestedData = useMemo(
		() => [
			{
				id: '1',
				label: 'Root',
				level: '0',
				open: true,
				items: nestFilteredFolders(folders, '1', filterFromInput),
				background: folderDestination.id === '1' ? 'highlight' : undefined
			}
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
					event.resource.calendar.id === '3'
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
					onChange={(e) => setInput(e.target.value)}
				/>

				<FolderItem
					folders={nestedData}
					showInput
					label={t('label.new_calendar', 'New Calendar')}
					btnClick={toggleModal}
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
						event.resource.calendar.id === '3'
							? t('label.restore', 'Restore')
							: t('label.move', 'Move')
					}
					disabled={!folderDestination.id || folderDestination.id === currentFolder.id}
					t={t}
				/>
			</Container>
		</Container>
	);
}
