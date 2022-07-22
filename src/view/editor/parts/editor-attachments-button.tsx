/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Dropdown, Icon, Padding, Text, Tooltip } from '@zextras/carbonio-design-system';
import { getAction } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { uploadParts } from '../../../commons/upload-parts';
import { selectEditorAttach, selectEditorAttachmentFiles } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';
import { ResizedIconCheckbox } from './editor-styled-components';
import { useGetPublicUrl } from '../editor-util-hooks/use-get-public-url';

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

export const EditorAttachmentsButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const [t] = useTranslation();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [openDD, setOpenDD] = useState(false);
	const attachmentFiles = useSelector(selectEditorAttachmentFiles(editorId));
	const parts = useSelector(selectEditorAttach(editorId));
	const { onAttachmentsChange, onTextChange } = callbacks;

	const onFileClick = useCallback(() => {
		setOpenDD(false);
		if (inputRef.current) {
			inputRef.current.click();
		}
	}, []);

	const [getLink, getLinkAvailable] = useGetPublicUrl({
		editorId,
		onTextChange
	});

	const actionURLTarget = useMemo(
		() => ({
			title: t('label.choose_file', 'Choose file'),
			confirmAction: getLink,
			confirmLabel: t('label.share_public_link', 'Share Public Link'),
			allowFiles: true,
			allowFolders: false
		}),
		[getLink, t]
	);

	const [getFilesAction, getFilesActionAvailable] = getAction(
		'carbonio_files_action',
		'files-select-nodes',
		actionURLTarget
	);
	const publicUrlItem = useMemo(
		() => ({
			...getFilesAction,
			label: t('composer.attachment.url', 'Add public link from Files'),
			icon: 'Link2',
			disabled: !getFilesActionAvailable || !getLinkAvailable,
			click: (a: any): void => {
				setOpenDD(false);
				getFilesAction?.click && getFilesAction.click(a);
			}
		}),
		[getFilesAction, getFilesActionAvailable, getLinkAvailable, t]
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
			publicUrlItem
		],
		[onFileClick, t, publicUrlItem]
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
				onAttachmentsChange({ aid: map(payload, (el) => el.aid), mp }, attachmentFilesArr);
			});
		}
	}, [editorId, parts, onAttachmentsChange, attachmentFiles]);

	return (
		<>
			<Tooltip label={t('tooltip.add_attachments', 'Add attachments')}>
				<Dropdown items={attachmentsItems} display="inline-block" width="fit" forceOpen={openDD}>
					<ResizedIconCheckbox
						onChange={(): null => null}
						icon="AttachOutline"
						onClick={(): void => setOpenDD(!openDD)}
						value={openDD}
					/>
				</Dropdown>
			</Tooltip>
			<FileInput type="file" ref={inputRef} onChange={onChange} multiple />
		</>
	);
};
