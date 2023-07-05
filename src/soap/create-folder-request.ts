/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createFolderRequest = async ({
	name,
	parent,
	color,
	excludeFreeBusy
}: any): Promise<any> =>
	soapFetch('CreateFolder', {
		_jsns: 'urn:zimbraMail',
		folder: {
			color,
			f: excludeFreeBusy ? 'b#' : '#',
			l: parent,
			name,
			view: 'appointment'
		}
	});
