/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: { context: { change: { token: 15778 } } },
	Body: { SendShareNotificationResponse: { _jsns: 'urn:zimbraMail' } }
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleSendShareNotificationRequest = (req, res, ctx) => {
	const response = getResponse();
	return res(ctx.json(response));
};
