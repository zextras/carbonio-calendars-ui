/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';

const getResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: {
				id: 171942,
				_content: 171942
			},
			change: {
				token: 14386
			}
		}
	},
	Body: {
		FolderActionResponse: {
			action: {
				id: '2047',
				op: 'update'
			},
			_jsns: 'urn:zimbraMail'
		}
	}
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleFolderActionRequest = (req, res, ctx) => {
	const response = getResponse();
	return res(ctx.json(response));
};
