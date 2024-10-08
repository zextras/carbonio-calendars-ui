/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState, ReactElement } from 'react';

import {
	Container,
	Icon,
	Padding,
	Link,
	Row,
	Text,
	useTheme
} from '@zextras/carbonio-design-system';
import { map, filter, reduce, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { Attachment } from './attachment';
import { getAttachmentsDownloadLink } from './attachment-utils';
import { getFileExtension, calcColor } from '../../commons/utilities';

type Attachments = Array<{
	part: any;
	mid: string;
	filename: string;
	contentType: string;
	name: string;
	aid?: string;
}>;

type AttachmentsBlockProps = {
	attachments: Attachments;
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
			const attachmentFiles = filter(attachments, (attachment) =>
				attachment.name ? attachment.name !== part : !attachment.aid || attachment.aid !== part
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
				map(attachments, (attachment) => {
					const fileExtension = getFileExtension(attachment);
					const color = calcColor(attachment.contentType, theme);
					return {
						extension: fileExtension,
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
						{map(attachToVisualize, (attachment, index) => (
							<Attachment
								key={`att-${attachment.filename}-${index}`}
								subject={subject}
								id={id}
								part={attachment.name ?? attachment.aid}
								isEditor={isEditor}
								removeAttachment={removeAttachment}
								disabled={!attachment.name || !!disabled}
								iconColors={iconColors}
								attachment={attachment}
							/>
						))}
					</Container>
				</Container>
			)}
		</>
	);
};
