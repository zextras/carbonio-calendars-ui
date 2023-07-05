/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: {
				id: 1403,
				_content: 1403
			}
		}
	},
	Body: {
		SendInviteReplyResponse: {
			apptId: '45410',
			calItemId: '45410',
			invId: '45410-46701',
			_jsns: 'urn:zimbraMail'
		}
	}
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleSendInviteReplyRequest = (req, res, ctx) => {
	const response = getResponse();
	return res(ctx.json(response));
};
