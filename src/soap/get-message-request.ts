/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export const getMessageRequest = async ({
	inviteId,
	ridZ
}: {
	inviteId: string;
	ridZ?: string;
}): Promise<any> => {
	const response = await soapFetch('GetMsg', {
		_jsns: 'urn:zimbraMail',
		m: omitBy(
			{
				html: 1,
				needExp: 1,
				id: inviteId,
				ridZ,
				header: [
					{
						n: 'List-ID'
					},
					{
						n: 'X-Zimbra-DL'
					},
					{
						n: 'IN-REPLY-TO'
					}
				],
				max: 250000
			},
			isNil
		)
	});
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
