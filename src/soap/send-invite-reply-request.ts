/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export type SendInviteReplyRejectedType = { error: boolean; m?: never; Fault: any };
export type SendInviteReplyFulfilledType = { m: any; Fault?: never; error?: never };
export type SendInviteReplyReturnType = SendInviteReplyFulfilledType | SendInviteReplyRejectedType;

export const sendInviteReplyRequest = async ({
	id,
	action,
	updateOrganizer
}: {
	id: string;
	action: string;
	updateOrganizer: boolean;
}): Promise<SendInviteReplyReturnType> => {
	const response: SendInviteReplyReturnType = await soapFetch('SendInviteReply', {
		_jsns: 'urn:zimbraMail',
		id,
		compNum: 0,
		verb: action,
		rt: 'r',
		updateOrganizer
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
