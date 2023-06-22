/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleGetFreeBusy = (req, res, ctx) => {
	const response = {
		Header: {
			context: {
				session: { id: 191337, _content: 191337 }
			}
		},
		Body: {
			GetFreeBusyResponse: { usr: [] }
		}
	};
	return res(ctx.json(response));
};
