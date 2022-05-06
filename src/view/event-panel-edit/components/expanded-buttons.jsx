/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { reduce, map } from 'lodash';
import styled from 'styled-components';
import {
	Padding,
	Tooltip,
	IconCheckbox,
	Icon,
	Text,
	Dropdown
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const ResizedIconCheckbox = styled(IconCheckbox)`
	[class^='Padding__Comp'] {
		padding: 6px;
		svg {
			height: 20px;
			width: 20px;
		}
	}
`;

const FileInput = styled.input`
	display: none;
`;

export const retrieveAttachmentsType = (original, disposition, dataID) =>
	reduce(
		original.parts[0]?.parts ?? [],
		(acc, part) =>
			part.disposition && part.disposition === disposition
				? [...acc, { part: part.name, mid: dataID }]
				: acc,
		[]
	);

export const addAttachments = async (
	saveDraftCb,
	uploadAttachmentsCb,
	compositionData,
	invite,
	files
) => {
	const { payload } = await uploadAttachmentsCb(files);
	const mp =
		invite?.parts &&
		retrieveAttachmentsType(invite, 'attachment', compositionData.resource.inviteId);
	return { payload, mp, files };
};

export default function ExpandedButtons({ data, callbacks, invite, isSmallView, disabled }) {
	const [t] = useTranslation();
	const inputRef = useRef();
	const [openDD, setOpenDD] = useState(false);
	const onFileClick = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.value = null;
			inputRef.current.click();
		}
	}, []);

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
				id: 'driveAttachment',
				icon: 'DriveOutline',
				label: t('composer.attachment.drive', 'Add from Drive'),
				click: () => {
					setOpenDD(false);
				},
				disabled: true
			},
			{
				id: 'contactsModAttachment',
				icon: 'ContactsModOutline',
				label: t('composer.attachment.contactsMod', 'add contact card'),
				click: () => {
					setOpenDD(false);
				},
				disabled: true
			}
		],
		[onFileClick, t]
	);
	return (
		<>
			{!isSmallView && (
				<Tooltip label={t('tooltip.enable_disable_rich_text', 'Enable/Disable rich text editor')}>
					<ResizedIconCheckbox
						icon="Text"
						value={data.resource.isRichText}
						onClick={() => {
							callbacks.onToggleRichText(!data.resource.isRichText);
						}}
						onChange={() => null}
					/>
				</Tooltip>
			)}
			<Padding right="small">
				<Tooltip label={t('tooltip.add_attachments', 'Add attachments')}>
					<Dropdown
						items={attachmentsItems}
						display="inline-block"
						width="fit"
						disabled={disabled}
						forceOpen={openDD && !disabled}
					>
						<ResizedIconCheckbox
							onChange={() => null}
							icon="AttachOutline"
							onClick={() => setOpenDD(!openDD)}
							disabled={disabled}
							value={disabled ? true : openDD}
						/>
					</Dropdown>
				</Tooltip>
			</Padding>

			<FileInput
				type="file"
				ref={inputRef}
				onChange={() =>
					addAttachments(
						callbacks.onSave,
						callbacks.uploadAttachments,
						data,
						invite,
						inputRef.current.files
					).then(({ payload, mp }) => {
						const attachments = map(payload, (file) => ({
							contentType: file.ct,
							disposition: 'attachment',
							filename: file.filename,
							name: undefined,
							size: file.s,
							aid: file.aid
						}));
						callbacks.onAttachmentsChange(
							{ aid: map(payload, (el) => el.aid), mp },
							data?.resource?.attachmentFiles
								? [...data.resource.attachmentFiles, ...attachments]
								: attachments,
							false
						);
					})
				}
				multiple
			/>
		</>
	);
}
