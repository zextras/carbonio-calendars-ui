/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';

import { convertToDecimal } from './utilities';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const uploadParts = async (files: any): Promise<any> =>
	Promise.all(
		map(files, (file) =>
			fetch('/service/upload?fmt=extended,raw', {
				headers: {
					'Cache-Control': 'no-cache',
					'X-Requested-With': 'XMLHttpRequest',
					'Content-Type': `${file.type || 'application/octet-stream'};`,
					'Content-Disposition': `attachment; filename="${convertToDecimal(file.name)}"`
				},
				method: 'POST',
				body: file
			})
				.then((res) => res.text())
				// eslint-disable-next-line no-eval
				.then((txt) => eval(`[${txt}]`))
				.then((val) => val[2][0])
		)
	);
