/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Dropdown, Icon, Padding, Text, Tooltip } from '@zextras/carbonio-design-system';
import { getIntegratedFunction, t } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { uploadParts } from '../../../commons/upload-parts';
import {
	selectEditorAttach,
	selectEditorAttachmentFiles,
	selectEditorDisabled
} from '../../../store/selectors/editor';
import { editEditorAttachments } from '../../../store/slices/editor-slice';
import { EditorProps } from '../../../types/editor';
import { ResizedIconCheckbox } from './editor-styled-components';
import { useGetPublicUrl } from '../editor-util-hooks/use-get-public-url';
import { useGetFilesFromDrive } from '../editor-util-hooks/use-get-drive-files';

const FileInput = styled.input`
	display: none;
`;

export const addAttachments = async (
	editorId: string,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	parts: any,
	files: FileList
): Promise<{ payload: any; mp: any; files: any }> => {
	const res = await uploadParts(files);
	return { payload: res, mp: parts, files };
};

export const EditorAttachmentsButton = ({ editorId }: EditorProps): ReactElement => {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [openDD, setOpenDD] = useState(false);
	const attachmentFiles = useSelector(selectEditorAttachmentFiles(editorId));
	const parts = useSelector(selectEditorAttach(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

	const onFileClick = useCallback(() => {
		setOpenDD(false);
		if (inputRef.current) {
			inputRef.current.click();
		}
	}, []);

	const [getLink, getLinkAvailable] = useGetPublicUrl({
		editorId
	});

	const [getFilesFromDrive, getFilesAvailable] = useGetFilesFromDrive({
		editorId
	});

	const actionURLTarget = useMemo(
		() => ({
			title: t('label.choose_file', 'Choose file'),
			confirmAction: getLink,
			confirmLabel: t('label.share_public_link', 'Share Public Link'),
			allowFiles: true,
			allowFolders: false
		}),
		[getLink]
	);

	const [getFilesAction, getFilesActionAvailable] = getIntegratedFunction('select-nodes');
	const publicUrlItem = useMemo(
		() => ({
			label: t('composer.attachment.url', 'Add public link from Files'),
			icon: 'Link2',
			id: 'carbonio_files_action_link',
			disabled: !getFilesActionAvailable || !getLinkAvailable,
			click: (): void => {
				setOpenDD(false);
				getFilesAction && getFilesAction(actionURLTarget);
			}
		}),
		[actionURLTarget, getFilesAction, getFilesActionAvailable, getLinkAvailable]
	);

	const actionTarget = useMemo(
		() => ({
			title: t('label.choose_file', 'Choose file'),
			confirmAction: getFilesFromDrive,
			confirmLabel: t('label.select', 'Select'),
			allowFiles: true,
			allowFolders: false
		}),
		[getFilesFromDrive]
	);

	const addFileItem = useMemo(
		() => ({
			label: t('composer.attachment.files', 'Add from Files'),
			icon: 'DriveOutline',
			id: 'carbonio_files_action',
			disabled: !getFilesActionAvailable || !getFilesAvailable,
			click: (): void => {
				setOpenDD(false);
				getFilesAction && getFilesAction(actionTarget);
			}
		}),
		[actionTarget, getFilesAction, getFilesActionAvailable, getFilesAvailable]
	);

	const attachmentsItems = useMemo(
		() => [
			{
				id: 'localAttachment',
				icon: 'MonitorOutline',
				label: t('composer.attachment.local', 'Add from local'),
				click: onFileClick,
				customComponent: (
					<>
						<Icon icon="MonitorOutline" size="medium" />
						<Padding horizontal="extrasmall" />
						<Text>{t('composer.attachment.local', 'Add from local')}</Text>
					</>
				)
			},
			{
				...addFileItem,
				id: addFileItem.id ?? ''
			},
			{
				...publicUrlItem,
				id: publicUrlItem.id ?? ''
			}
		],
		[onFileClick, addFileItem, publicUrlItem]
	);

	const onChange = useCallback((): void => {
		if (inputRef?.current?.files) {
			addAttachments(editorId, parts, inputRef.current.files).then(({ payload, mp }) => {
				const attachments = map(payload, (file) => ({
					contentType: file.ct,
					disposition: 'attachment',
					filename: file.filename,
					name: undefined,
					size: file.s,
					aid: file.aid
				}));
				const attachmentFilesArr = [...(attachmentFiles ?? []), ...attachments];
				dispatch(
					editEditorAttachments({
						id: editorId,
						attach: { aid: map(payload, (el) => el.aid), mp },
						attachmentFiles: attachmentFilesArr
					})
				);
			});
		}
	}, [editorId, parts, attachmentFiles, dispatch]);

	return (
		<>
			<Tooltip label={t('tooltip.add_attachments', 'Add attachments')}>
				<Dropdown items={attachmentsItems} display="inline-block" width="fit" forceOpen={openDD}>
					<ResizedIconCheckbox
						onChange={(): null => null}
						icon="AttachOutline"
						onClick={(): void => setOpenDD(!openDD)}
						value={openDD}
						disabled={disabled?.attachmentsButton}
					/>
				</Dropdown>
			</Tooltip>
			<FileInput type="file" ref={inputRef} onChange={onChange} multiple />
		</>
	);
};
