/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useMemo, useRef } from 'react';

import {
	Container,
	ContainerProps,
	getColor,
	IconButton,
	Padding,
	Row,
	Text,
	TextProps,
	Tooltip
} from '@zextras/carbonio-design-system';
import { PreviewsManagerContext } from '@zextras/carbonio-ui-preview';
import { find } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { getAttachmentsDownloadLink, getAttachmentsPreviewLink } from './attachment-utils';
import { humanFileSize, previewType } from '../../commons/file-preview';
import { getFileExtension } from '../../commons/utilities';

type AttachmentProps = {
	subject?: string;
	id?: string;
	part: string;
	isEditor: boolean;
	removeAttachment: (arg: string) => void;
	disabled: boolean;
	iconColors: Array<{
		extension: string;
		color: string;
	}>;
	att: any;
};

const AttachmentHoverBarContainer = styled(Container)`
	display: none;
	height: 0;
`;

const AttachmentContainer = styled(Container)<ContainerProps & { disabled: boolean }>`
	border-radius: 0.125rem;
	width: calc(50% - 0.5rem);
	transition: 0.2s ease-out;
	margin-bottom: ${({ theme }): string => theme.sizes.padding.small};
	margin-right: ${({ theme }): string => theme.sizes.padding.small};
	box-sizing: border-box;
	&:hover {
		background-color: ${({ theme, background = 'transparent', disabled }): string =>
			disabled ? 'gray5' : getColor(`${background}.hover`, theme)};
		& ${AttachmentHoverBarContainer} {
			display: flex;
		}
	}
	&:focus {
		background-color: ${({ theme, background = 'transparent' }): string =>
			getColor(`${background}.focus`, theme)};
	}
	cursor: ${({ disabled }): string => (disabled ? 'default' : 'pointer')};
`;

const AttachmentLink = styled.a`
	margin-bottom: ${({ theme }): string => theme.sizes.padding.small};
	position: relative;
	text-decoration: none;
`;

const AttachmentExtension = styled(Text)<
	TextProps & { background?: { extension: string; color: string } }
>`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 2rem;
	height: 2rem;
	border-radius: ${({ theme }): string => theme.borderRadius};
	background-color: ${({ theme, disabled, background }): string =>
		disabled ? theme.palette.primary.disabled : background?.color || theme.palette.primary.regular};
	color: ${({ theme }): string => theme.palette.gray6.regular};
	font-size: calc(${({ theme }): string => theme.sizes.font.small} - 0.125rem);
	text-transform: uppercase;
	margin-right: ${({ theme }): string => theme.sizes.padding.small};
`;

export const Attachment = ({
	subject,
	id,
	part,
	isEditor,
	removeAttachment,
	disabled = false,
	iconColors,
	att
}: AttachmentProps): ReactElement => {
	const { createPreview } = useContext(PreviewsManagerContext);
	const extension = getFileExtension(att);
	const sizeLabel = useMemo(() => humanFileSize(att.size), [att.size]);
	const [t] = useTranslation();
	const inputRef = useRef<HTMLAnchorElement>(null);
	const inputRef2 = useRef<HTMLAnchorElement>(null);
	const downloadAttachment = useCallback(() => {
		if (inputRef?.current) {
			inputRef.current.click();
		}
	}, [inputRef]);

	const downloadLink = useMemo(() => {
		if (!id) return undefined;
		return getAttachmentsDownloadLink({
			messageId: id,
			messageSubject: subject ?? '',
			attachments: [att.name],
			attachmentType: att.contentType
		});
	}, [id, subject, att.name, att.contentType]);

	const attachmentPreviewLink = useMemo(() => {
		if (!id) return undefined;
		return getAttachmentsPreviewLink({
			messageId: id,
			messageSubject: subject ?? '',
			attachments: [att.name],
			attachmentType: att.contentType
		});
	}, [att.contentType, att.name, id, subject]);

	const preview = useCallback(
		(ev) => {
			ev.preventDefault();
			const pType = previewType(att.contentType);
			if (pType && attachmentPreviewLink) {
				createPreview({
					src: attachmentPreviewLink,
					previewType: pType,
					/** Left Action for the preview */
					closeAction: {
						id: 'close',
						icon: 'ArrowBack',
						tooltipLabel: t('preview.close', 'Close Preview')
					},
					/** Actions for the preview */
					// actions: HeaderAction[],
					/** Extension of the file, shown as info */
					extension: att.filename.substring(att.filename.lastIndexOf('.') + 1),
					/** Name of the file, shown as info */
					filename: att.filename,
					/** Size of the file, shown as info */
					size: humanFileSize(att.size)
				});
			} else if (inputRef2.current) {
				inputRef2.current.click();
			}
		},
		[att.contentType, att.filename, att.size, attachmentPreviewLink, createPreview, t]
	);
	return (
		<AttachmentContainer
			orientation="horizontal"
			mainAlignment="flex-start"
			height="fit"
			background={disabled ? 'gray5' : 'gray3'}
			disabled={disabled}
			padding={{ right: 'medium' }}
		>
			<Tooltip
				key={isEditor ? `${id}-Edit` : `${id}-Preview`}
				label={
					disabled
						? t('action.save_to_preview', 'Save to preview')
						: t('action.preview', 'Click to preview')
				}
			>
				<Row
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					onClick={preview}
					takeAvailableSpace
				>
					<AttachmentExtension
						background={find(iconColors, (ic) => ic.extension === extension)}
						disabled={disabled}
					>
						{extension}
					</AttachmentExtension>
					<Row orientation="vertical" crossAlignment="flex-start" takeAvailableSpace>
						<Padding style={{ width: '100%' }} bottom="extrasmall">
							<Text disabled={disabled}>{att.filename}</Text>
						</Padding>
						<Text disabled={disabled} color="gray1" size="small">
							{sizeLabel}
						</Text>
					</Row>
				</Row>
			</Tooltip>
			<Row orientation="horizontal" crossAlignment="center">
				<AttachmentHoverBarContainer orientation="horizontal">
					{disabled ? (
						<Tooltip key={`${id}-DeletePermanentlyOutline`} label={t('label.delete', 'Delete')}>
							<IconButton
								size="medium"
								icon={'DeletePermanentlyOutline'}
								onClick={(): void => removeAttachment(part)}
							/>
						</Tooltip>
					) : (
						<Tooltip
							key={isEditor ? `${id}-EditOutline` : `${id}-DeletePermanentlyOutline`}
							label={isEditor ? t('label.delete', 'Delete') : t('label.download', 'Download')}
						>
							<IconButton
								size="medium"
								icon={isEditor ? 'DeletePermanentlyOutline' : 'DownloadOutline'}
								onClick={isEditor ? (): void => removeAttachment(part) : downloadAttachment}
							/>
						</Tooltip>
					)}
				</AttachmentHoverBarContainer>
			</Row>
			{!disabled && (
				<AttachmentLink
					rel="noopener"
					ref={inputRef2}
					target="_blank"
					href={`/service/home/~/?auth=co&id=${id}&part=${part}`}
				/>
			)}
			<AttachmentLink ref={inputRef} rel="noopener" target="_blank" href={downloadLink} />
		</AttachmentContainer>
	);
};
