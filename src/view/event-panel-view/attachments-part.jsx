/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { map, filter, reduce, uniqBy, find } from 'lodash';
import {
	Container,
	Icon,
	IconButton,
	Padding,
	Link,
	Row,
	Text,
	Tooltip,
	useTheme
} from '@zextras/carbonio-design-system';
import { getFileExtension, calcColor } from '../../commons/utilities';

function getSizeLabel(size) {
	let value = '';
	if (size < 1024000) {
		value = `${Math.round((size / 1024) * 100) / 100} KB`;
	} else if (size < 1024000000) {
		value = `${Math.round((size / 1024 / 1024) * 100) / 100} MB`;
	} else {
		value = `${Math.round((size / 1024 / 1024 / 1024) * 100) / 100} GB`;
	}
	return value;
}

function getAttachmentsLink(messageId, messageSubject, attachments) {
	if (attachments.length > 1) {
		return `/service/home/~/?auth=co&id=${messageId}&filename=${messageSubject}&charset=UTF-8&part=${attachments.join(
			','
		)}&disp=a&fmt=zip`;
	}
	return `/service/home/~/?auth=co&id=${messageId}&part=${attachments.join(',')}&disp=a`;
}

const AttachmentHoverBarContainer = styled(Container)`
	display: none;
	height: 0px;
`;

const AttachmentContainer = styled(Container)`
	border-radius: 2px;
	width: ${({ isComplete }) => (isComplete ? 'calc(25% - 8px)' : 'calc(50% - 8px)')};
	transition: 0.2s ease-out;
	margin-bottom: ${({ theme }) => theme.sizes.padding.small};
	margin-right: ${({ theme }) => theme.sizes.padding.small};
	box-sizing: border-box;
	&:hover {
		background-color: ${({ theme, background, disabled }) =>
			disabled ? 'gray5' : theme.palette[background].hover};
		& ${AttachmentHoverBarContainer} {
			display: flex;
		}
	}
	&:focus {
		background-color: ${({ theme, background }) => theme.palette[background].focus};
	}
	cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`;

const AttachmentLink = styled.a`
	margin-bottom: ${({ theme }) => theme.sizes.padding.small};
	position: relative;
	text-decoration: none;
`;

const AttachmentExtension = styled(Text)`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 32px;
	height: 32px;
	border-radius: ${({ theme }) => theme.borderRadius};
	background-color: ${({ theme, disabled, background }) =>
		disabled ? theme.palette.primary.disabled : background.color || theme.palette.primary.regular};
	color: ${({ theme }) => theme.palette.gray6.regular};
	font-size: calc(${({ theme }) => theme.sizes.font.small} - 2px);
	text-transform: uppercase;
	margin-right: ${({ theme }) => theme.sizes.padding.small};
`;

function Attachment({
	filename,
	size,
	link,
	message,
	part,
	isEditor,
	removeAttachment,
	isComplete,
	disabled = false,
	iconColors,
	att
}) {
	const extension = getFileExtension(att);
	const sizeLabel = useMemo(() => getSizeLabel(size), [size]);
	const [t] = useTranslation();
	const inputRef = useRef();
	const inputRef2 = useRef();
	const downloadAttachment = useCallback(() => {
		if (inputRef.current) {
			// eslint-disable-next-line no-param-reassign
			inputRef.current.value = null;
			inputRef.current.click();
		}
	}, [inputRef]);

	return (
		<AttachmentContainer
			orientation="horizontal"
			mainAlignment="flex-start"
			height="fit"
			background={disabled ? 'gray5' : 'gray3'}
			isComplete={isComplete}
			disabled={disabled}
			padding={{ right: 'medium' }}
		>
			<Tooltip
				key={isEditor ? `${message.id}-Edit` : `${message.id}-Preview`}
				label={
					disabled
						? t('action.save_to_preview', 'Save to preview')
						: t('action.preview', 'Click to preview in another tab')
				}
			>
				<Row
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					onClick={(ev) => {
						ev.preventDefault();
						if (inputRef2.current) {
							// eslint-disable-next-line no-param-reassign
							inputRef2.current.value = null;
							inputRef2.current.click();
						}
					}}
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
							<Text disabled={disabled}>{filename}</Text>
						</Padding>
						<Text disabled={disabled} color="gray1" size="small">
							{sizeLabel}
						</Text>
					</Row>
				</Row>
			</Tooltip>
			<Row orientation="horizontal" crossAlignment="center">
				<AttachmentHoverBarContainer>
					{disabled ? (
						<Tooltip
							key={`${message.id}-DeletePermanentlyOutline`}
							label={t('label.delete', 'Delete')}
						>
							<IconButton
								size="medium"
								icon={'DeletePermanentlyOutline'}
								onClick={() => removeAttachment(part)}
							/>
						</Tooltip>
					) : (
						<Tooltip
							key={
								isEditor ? `${message.id}-EditOutline` : `${message.id}-DeletePermanentlyOutline`
							}
							label={isEditor ? t('label.delete', 'Delete') : t('label.download', 'Download')}
						>
							<IconButton
								size="medium"
								icon={isEditor ? 'DeletePermanentlyOutline' : 'DownloadOutline'}
								onClick={isEditor ? () => removeAttachment(part) : downloadAttachment}
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
					href={`/service/home/~/?auth=co&id=${message.id}&part=${part}`}
				/>
			)}
			<AttachmentLink ref={inputRef} rel="noopener" target="_blank" href={link} />
		</AttachmentContainer>
	);
}

export default function AttachmentsBlock({
	attachments,
	message,
	callbacks,
	isEditor = false,
	isComplete = false
}) {
	const [t] = useTranslation();
	const [expanded, setExpanded] = useState(false);
	const theme = useTheme();
	const attachmentsCount = useMemo(() => attachments.length, [attachments]);
	const attachmentsParts = useMemo(() => map(attachments, 'name'), [attachments]);
	const actionsDownloadLink = useMemo(
		() => getAttachmentsLink(message?.id, message?.subject, attachmentsParts),
		[message, attachmentsParts]
	);

	const removeAttachment = useCallback(
		(part) => {
			const attachmentFiles = filter(attachments, (p) =>
				p.name ? p.name !== part : !p.aid || p.aid !== part
			);
			callbacks.onAttachmentsChange(
				{
					aid: reduce(attachmentFiles, (acc, item) => (item.aid ? [...acc, item.aid] : acc), []),
					mp: reduce(
						attachmentFiles,
						(acc, item) => (item.name ? [...acc, { part: item.name, mid: message.id }] : acc),
						[]
					)
				},
				attachmentFiles,
				true
			);
		},
		[attachments, callbacks, message]
	);

	const removeAllAttachments = useCallback(() => {
		callbacks.onAttachmentsChange({ mp: [] }, [], true);
	}, [callbacks]);
	const attachToVisualize = useMemo(() => {
		if (!expanded && isComplete) return attachments.slice(0, 4);
		if (!expanded && !isComplete) return attachments.slice(0, 2);
		return attachments;
	}, [attachments, expanded, isComplete]);

	const iconColors = useMemo(
		() =>
			uniqBy(
				map(attachments, (att) => {
					const fileExtn = getFileExtension(att);
					const color = calcColor(att.contentType, theme);

					if (iconColors) {
						return [
							...iconColors,
							{
								extension: fileExtn,
								color
							}
						];
					}
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
		attachmentsCount > 0 && (
			<Container mainAlignment="flex-start" crossAlignment="flex-start">
				<Row mainAlignment="flex-start" padding={{ top: 'extrasmall', bottom: 'medium' }}>
					<Padding right="small">
						{attachmentsCount < 3 && attachmentsCount > 1 && (
							<Text color="gray1">
								{t('label.attachment', {
									count: attachmentsCount,
									defaultValue: 'Attachment',
									defaultValue_plural: '{{count}} Attachments'
								})}
							</Text>
						)}
						{attachmentsCount === 1 && (
							<Text color="gray1">{`1 ${t('label.attachment', {
								count: attachmentsCount,
								defaultValue: 'Attachment',
								defaultValue_plural: '{{count}} Attachments'
							})}`}</Text>
						)}
						{attachmentsCount > 2 &&
							(expanded ? (
								<Row onClick={() => setExpanded(false)} style={{ cursor: 'pointer' }}>
									<Padding right="small">
										<Text color="primary">
											{t('label.attachment', {
												count: attachmentsCount,
												defaultValue: 'Attachment',
												defaultValue_plural: '{{count}} Attachments'
											})}
										</Text>
									</Padding>
									<Icon icon="ArrowIosUpward" color="primary" />
								</Row>
							) : (
								<Row onClick={() => setExpanded(true)} style={{ cursor: 'pointer' }}>
									<Padding right="small">
										<Text color="primary">
											{t('label.show', {
												count: attachmentsCount,
												defaultValue: 'Show',
												defaultValue_plural: 'Show all'
											})}{' '}
											{t('label.attachment', {
												count: attachmentsCount,
												defaultValue: 'Attachment',
												defaultValue_plural: '{{count}} Attachments'
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
					>
						{isEditor
							? t('label.delete', {
									count: attachmentsCount,
									defaultValue: 'Delete',
									defaultValue_plural: 'Delete all'
							  })
							: t('label.download', {
									count: attachmentsCount,
									defaultValue: 'Download',
									defaultValue_plural: 'Download all'
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
							filename={att.filename}
							size={att.size}
							link={getAttachmentsLink(message?.id, message?.subject, [att.name])}
							message={message}
							part={att.name ?? att.aid}
							isEditor={isEditor}
							isComplete={isComplete}
							removeAttachment={removeAttachment}
							disabled={!att.name}
							iconColors={iconColors}
							att={att}
						/>
					))}
				</Container>
			</Container>
		)
	);
}
