/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useRef, useState, useContext, ReactElement } from 'react';

import {
	Container,
	Icon,
	IconButton,
	Padding,
	Link,
	Row,
	Text,
	Tooltip,
	useTheme,
	ContainerProps,
	TextProps,
	getColor
} from '@zextras/carbonio-design-system';
import { PreviewsManagerContext } from '@zextras/carbonio-ui-preview';
import { map, filter, reduce, uniqBy, find, includes } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { humanFileSize, previewType } from '../../commons/file-preview';
import { getFileExtension, calcColor } from '../../commons/utilities';

type GetAttachmentsLinkProps = {
	messageId: string;
	messageSubject: string;
	attachments: Array<string | undefined>;
	attachmentType?: string | undefined;
};

const getLocationOrigin = (): string => window.location.origin;

const getAttachmentsDownloadLink = ({
	messageId,
	messageSubject,
	attachments
}: GetAttachmentsLinkProps): string => {
	if (attachments?.length > 1) {
		return `/service/home/~/?auth=co&id=${messageId}&filename=${encodeURIComponent(messageSubject)}&charset=UTF-8&part=${attachments.join(
			','
		)}&disp=a&fmt=zip`;
	}
	return `/service/home/~/?auth=co&id=${messageId}&part=${attachments?.join(',')}&disp=a`;
};

export const getAttachmentsPreviewLink = ({
	messageId,
	messageSubject,
	attachments,
	attachmentType
}: GetAttachmentsLinkProps): string => {
	if (attachments.length > 1) {
		return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&filename=${messageSubject}&charset=UTF-8&part=${attachments.join(
			','
		)}&disp=a&fmt=zip`;
	}
	if (
		includes(['image/gif', 'image/png', 'image/jpeg', 'image/jpg', 'image/tiff'], attachmentType)
	) {
		return `${getLocationOrigin()}/service/preview/image/${messageId}/${
			attachments[0]
		}/0x0/?quality=high`;
	}
	if (includes(['application/pdf'], attachmentType)) {
		return `${getLocationOrigin()}/service/preview/pdf/${messageId}/${
			attachments[0]
		}/?first_page=1`;
	}
	if (
		includes(
			[
				'text/csv',
				'text/plain',
				'application/msword',
				'application/vnd.ms-excel',
				'application/vnd.ms-powerpoint',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				'application/vnd.oasis.opendocument.spreadsheet',
				'application/vnd.oasis.opendocument.presentation',
				'application/vnd.oasis.opendocument.text'
			],
			attachmentType
		)
	) {
		return `${getLocationOrigin()}/service/preview/document/${messageId}/${attachments.join(',')}`;
	}
	return `${getLocationOrigin()}/service/home/~/?auth=co&id=${messageId}&part=${attachments.join(
		','
	)}&disp=a`;
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

const Attachment = ({
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

type AttachmentsBlockProps = {
	attachments: Array<{
		part: any;
		mid: string;
		filename: string;
		contentType: string;
		name: string;
		aid?: string;
	}>;
	id?: string;
	subject: string;
	onAttachmentsChange?: (
		arg1: { aid?: string[]; mp: Array<{ part: any; mid: string }> },
		arg2: any
	) => void;
	isEditor?: boolean;
	disabled?: boolean;
};

export const AttachmentsBlock = ({
	attachments,
	id,
	subject,
	onAttachmentsChange,
	isEditor = false,
	disabled
}: AttachmentsBlockProps): ReactElement => {
	const [t] = useTranslation();
	const [expanded, setExpanded] = useState(false);
	const theme = useTheme();

	const attachmentsCount = useMemo(() => attachments.length, [attachments]);

	const actionsDownloadLink = useMemo(() => {
		const attachmentsParts = map(attachments, 'name');
		return id
			? getAttachmentsDownloadLink({
					messageId: id,
					messageSubject: subject ?? '',
					attachments: attachmentsParts
				})
			: undefined;
	}, [attachments, id, subject]);

	const removeAttachment = useCallback(
		(part) => {
			const attachmentFiles = filter(attachments, (p) =>
				p.name ? p.name !== part : !p.aid || p.aid !== part
			);
			if (onAttachmentsChange) {
				onAttachmentsChange(
					{
						aid: reduce(
							attachmentFiles,
							(acc, item) => (item.aid ? [...acc, item.aid] : acc),
							[] as string[]
						),
						mp: reduce(
							attachmentFiles,
							(acc, item) => (item.name && id ? [...acc, { part: item.name, mid: id }] : acc),
							[] as Array<{ part: any; mid: string }>
						)
					},
					attachmentFiles
				);
			}
		},
		[attachments, id, onAttachmentsChange]
	);

	const removeAllAttachments = useCallback(() => {
		if (onAttachmentsChange) {
			onAttachmentsChange({ mp: [] }, []);
		}
	}, [onAttachmentsChange]);

	const attachToVisualize = useMemo(
		() => (expanded ? attachments : attachments.slice(0, 2)),
		[attachments, expanded]
	);

	const iconColors = useMemo(
		() =>
			uniqBy(
				map(attachments, (att) => {
					const fileExtn = getFileExtension(att);
					const color = calcColor(att.contentType, theme);

					return {
						extension: fileExtn,
						color
					};
				}),
				'extension'
			),
		[attachments, theme]
	);

	return (
		<>
			{attachmentsCount > 0 && (
				<Container mainAlignment="flex-start" crossAlignment="flex-start">
					<Row mainAlignment="flex-start" padding={{ top: 'extrasmall', bottom: 'medium' }}>
						<Padding right="small">
							{attachmentsCount < 3 && attachmentsCount > 1 && (
								<Text color="gray1">
									{t('label.attachment', {
										count: attachmentsCount,
										defaultValue_one: 'Attachment',
										defaultValue_other: '{{count}} Attachments'
									})}
								</Text>
							)}
							{attachmentsCount === 1 && (
								<Text color="gray1">{`1 ${t('label.attachment', {
									count: attachmentsCount,
									defaultValue_one: 'Attachment',
									defaultValue_other: '{{count}} Attachments'
								})}`}</Text>
							)}
							{attachmentsCount > 2 &&
								(expanded ? (
									<Row onClick={(): void => setExpanded(false)} style={{ cursor: 'pointer' }}>
										<Padding right="small">
											<Text color="primary">
												{t('label.attachment', {
													count: attachmentsCount,
													defaultValue_one: 'Attachment',
													defaultValue_other: '{{count}} Attachments'
												})}
											</Text>
										</Padding>
										<Icon icon="ArrowIosUpward" color="primary" />
									</Row>
								) : (
									<Row onClick={(): void => setExpanded(true)} style={{ cursor: 'pointer' }}>
										<Padding right="small">
											<Text color="primary">
												{t('label.show', {
													count: attachmentsCount,
													defaultValue_one: 'Show',
													defaultValue_other: 'Show all'
												})}{' '}
												{t('label.attachment', {
													count: attachmentsCount,
													defaultValue_one: 'Attachment',
													defaultValue_other: '{{count}} Attachments'
												})}
											</Text>
										</Padding>
										<Icon icon="ArrowIosDownward" color="primary" />
									</Row>
								))}
						</Padding>
						<Link
							size="medium"
							href={isEditor ? undefined : actionsDownloadLink}
							onClick={isEditor ? removeAllAttachments : undefined}
							disabled={disabled}
						>
							{isEditor
								? t('label.delete', {
										count: attachmentsCount,
										defaultValue_one: 'Delete',
										defaultValue_other: 'Delete all'
									})
								: t('label.download', {
										count: attachmentsCount,
										defaultValue_one: 'Download',
										defaultValue_other: 'Download all'
									})}
						</Link>
					</Row>

					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						wrap="wrap"
					>
						{map(attachToVisualize, (att, index) => (
							<Attachment
								key={`att-${att.filename}-${index}`}
								subject={subject}
								id={id}
								part={att.name ?? att.aid}
								isEditor={isEditor}
								removeAttachment={removeAttachment}
								disabled={!att.name ?? disabled}
								iconColors={iconColors}
								att={att}
							/>
						))}
					</Container>
				</Container>
			)}
		</>
	);
};
