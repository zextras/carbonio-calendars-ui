/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver } from 'msw';

import { CarbonioMailboxRestHandlerRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handlers';
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
export const handleSearchRequest: HttpResponseResolver<
	never,
	CarbonioMailboxRestHandlerRequest<any>,
	SuccessSoapResponse<any>
> = () => {
	const response = emptySearchResponse();
	return HttpResponse.json(response);
};
