/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { InstanceExceptionId } from '../utils/event';

export type SendInviteReplyRejectedType = {
	error: boolean;
	Fault?: {
		Code: {
			Value: string;
		};
		Reason: {
			Text: string;
		};
		Detail: {
			Error: {
				Code: string;
				Trace: string;
				_jsns: string;
			};
		};
	};
	apptId?: never;
	calItemId?: never;
	invId?: never;
};
export type SendInviteReplyFulfilledType = {
	Fault?: never;
	error?: never;
	apptId: string;
	calItemId: string;
	invId: string;
};
export type SendInviteReplyReturnType = SendInviteReplyFulfilledType | SendInviteReplyRejectedType;

export const sendInviteReplyRequest = async ({
	id,
	action,
	updateOrganizer,
	exceptId
}: {
	id: string;
	action: string;
	updateOrganizer: boolean;
	exceptId: InstanceExceptionId | undefined;
}): Promise<SendInviteReplyReturnType> => {
	const response: SendInviteReplyReturnType = await soapFetch('SendInviteReply', {
		_jsns: 'urn:zimbraMail',
		id,
		compNum: 0,
		exceptId,
		verb: action,
		rt: 'r',
		updateOrganizer
	});
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
