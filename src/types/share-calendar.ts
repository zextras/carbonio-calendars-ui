/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Grant } from '../carbonio-ui-commons/types/folder';

export type ShareCalendarModalProps = {
	folderName: string;
	folderId: string;
	closeFn?: () => void;
	onGoBack?: () => void;
	secondaryLabel?: string;
	isFromEditModal?: boolean;
	grant?: Array<Grant>;
};

export type ShareCalendarUrlProps = {
	folderName: string;
	onClose: () => void;
	isFromEditModal?: boolean;
};

export type UrlColumnProps = {
	label: string;
	tooltip: string;
	onUrlCopied: (label: string, type: string) => () => void;
	type: string;
};
