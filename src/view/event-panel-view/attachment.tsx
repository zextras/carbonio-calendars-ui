/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useMemo, useRef } from 'react';

import {
	Button,
	Container,
	ContainerProps,
	getColor,
	Padding,
	Row,
	Text,
	TextProps,
	Tooltip
} from '@zextras/carbonio-design-system';
import { PreviewsManagerContext } from '@zextras/carbonio-ui-preview';
import { TFunction } from 'i18next';
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
	attachment: any;
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

const getTooltipKey = (disabled: boolean, isEditor: boolean, id: string): string => {
	if (disabled) {
		return `${id}-DeletePermanentlyOutline`;
	}
	if (isEditor) {
		return `${id}-EditOutline`;
	}
	return `${id}-DeletePermanentlyOutline`;
};

const getButtonIcon = (disabled: boolean, isEditor: boolean): string => {
	if (disabled || isEditor) {
		return 'DeletePermanentlyOutline';
	}
	return 'DownloadOutline';
};

const getTooltipLabel = (disabled: boolean, isEditor: boolean, t: TFunction): string => {
	if (disabled || isEditor) {
		return t('label.delete', 'Delete');
	}
	return t('label.download', 'Download');
};

export const Attachment = ({
	subject,
	id,
	part,
	isEditor,
	removeAttachment,
	disabled = false,
	iconColors,
	attachment
}: AttachmentProps): ReactElement => {
	const { createPreview } = useContext(PreviewsManagerContext);
	const extension = getFileExtension(attachment);
	const sizeLabel = useMemo(() => humanFileSize(attachment.size), [attachment.size]);
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
			attachments: [attachment.name],
			attachmentType: attachment.contentType
		});
	}, [id, subject, attachment.name, attachment.contentType]);

	const attachmentPreviewLink = useMemo(() => {
		if (!id) return undefined;
		return getAttachmentsPreviewLink({
			messageId: id,
			messageSubject: subject ?? '',
			attachments: [attachment.name],
			attachmentType: attachment.contentType
		});
	}, [attachment.contentType, attachment.name, id, subject]);

	const preview = useCallback(
		(ev) => {
			ev.preventDefault();
			const pType = previewType(attachment.contentType);
			if (pType && attachmentPreviewLink) {
				createPreview({
					src: attachmentPreviewLink,
					previewType: pType,
					closeAction: {
						id: 'close',
						icon: 'ArrowBack',
						tooltipLabel: t('preview.close', 'Close Preview')
					},
					extension: attachment.filename.substring(attachment.filename.lastIndexOf('.') + 1),
					filename: attachment.filename,
					size: humanFileSize(attachment.size)
				});
			} else if (inputRef2.current) {
				inputRef2.current.click();
			}
		},
		[
			attachment.contentType,
			attachment.filename,
			attachment.size,
			attachmentPreviewLink,
			createPreview,
			t
		]
	);

	const getButtonOnClick = useCallback(() => {
		if (disabled || isEditor) {
			return removeAttachment(part);
		}
		return downloadAttachment();
	}, [disabled, downloadAttachment, isEditor, part, removeAttachment]);

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
							<Text disabled={disabled}>{attachment.filename}</Text>
						</Padding>
						<Text disabled={disabled} color="gray1" size="small">
							{sizeLabel}
						</Text>
					</Row>
				</Row>
			</Tooltip>
			<Row orientation="horizontal" crossAlignment="center">
				<AttachmentHoverBarContainer orientation="horizontal">
					<Tooltip
						key={getTooltipKey(disabled, isEditor, id ?? '')}
						label={getTooltipLabel(disabled, isEditor, t)}
					>
						<Button
							size="medium"
							icon={getButtonIcon(disabled, isEditor)}
							data-testid={'action-button'}
							onClick={getButtonOnClick}
						/>
					</Tooltip>
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
