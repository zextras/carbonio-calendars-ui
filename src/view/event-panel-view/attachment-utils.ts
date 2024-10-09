/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { includes } from 'lodash';

export const getLocationOrigin = (): string => window.location.origin;

export type GetAttachmentsLinkProps = {
	messageId: string;
	messageSubject: string;
	attachments: Array<string | undefined>;
	attachmentType?: string;
};

export const getAttachmentsDownloadLink = ({
	messageId,
	messageSubject,
	attachments
}: GetAttachmentsLinkProps): string => {
	if (attachments?.length < 1) return '';
	if (attachments?.length > 1) {
		return `/service/home/~/?auth=co&id=${messageId}&filename=${encodeURIComponent(messageSubject)}&charset=UTF-8&part=${attachments.join(
			','
		)}&disp=a&fmt=zip`;
	}
	return `/service/home/~/?auth=co&id=${messageId}&part=${attachments?.join(',')}&disp=a`;
};

export const getAttachmentsPreviewLink = ({
	messageId,
	attachments,
	attachmentType
}: GetAttachmentsLinkProps): string => {
	if (attachments.length < 1) return '';
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
