/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const sendInviteReplyRequest = async ({
	id,
	action,
	updateOrganizer
}: {
	id: string;
	action: string;
	updateOrganizer: boolean;
}): Promise<any> =>
	soapFetch('SendInviteReply', {
		_jsns: 'urn:zimbraMail',
		id,
		compNum: 0,
		verb: action,
		rt: 'r',
		updateOrganizer
	});
