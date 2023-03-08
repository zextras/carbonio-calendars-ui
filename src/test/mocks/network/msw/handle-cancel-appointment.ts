/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';
import { some } from 'lodash';

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
		CancelAppointmentResponse: {
			calItemId: '395',
			apptId: '395',
			invId: '395-394',
			ms: 5908,
			rev: 5908,
			echo: [],
			_jsns: 'urn:zimbraMail'
		}
	}
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleCancelAppointmentRequest = (req, res, ctx) => {
	const response = getResponse();
	return res(ctx.json(response));
};
