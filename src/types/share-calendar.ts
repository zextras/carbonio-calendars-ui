/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Grant } from '@zextras/carbonio-ui-commons';

export type ShareCalendarModalProps = {
	folderId: string;
	closeFn?: () => void;
	onGoBack?: () => void;
	secondaryLabel?: string;
	isFromEditModal?: boolean;
	grant?: Array<Grant>;
};
