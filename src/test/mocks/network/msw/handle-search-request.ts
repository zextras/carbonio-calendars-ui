/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';
import mockedData from '../../../generators';

export const filledSearchResponse = (): SuccessSoapResponse<any> => ({
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
		SearchResponse: {
			appt: [mockedData.getAppointment()],
			sortBy: 'dateDesc',
			more: false,
			offset: 0,
			_jsns: 'urn:zimbraMail'
		}
	}
});

const emptySearchResponse = (): SuccessSoapResponse<any> => ({
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
		SearchResponse: {
			sortBy: 'dateDesc',
			more: false,
			offset: 0,
			_jsns: 'urn:zimbraMail'
		}
	}
});

// TODO: fix types with the msw handlers refactor
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleSearchRequest = (req, res, ctx) => {
	const response = emptySearchResponse();
	return res(ctx.json(response));
};
