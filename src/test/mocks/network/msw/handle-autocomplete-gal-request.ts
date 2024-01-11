/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui/types/network/soap';
import { isNull, map, omitBy } from 'lodash';

import { Resource } from '../../../../types/editor';

export const getCustomResources = (resources?: Array<Resource>): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: {
				id: 1403,
				_content: 1403
			}
		}
	},
	Body: {
		AutoCompleteGalResponse: omitBy(
			{
				cn: resources
					? map(resources, (r) => ({
							id: r.id,
							fileAsStr: r.label,
							_attrs: {
								zimbraCalResType: r.type,
								email: r.email
							}
					  }))
					: undefined,
				sortBy: 'dateDesc',
				offset: 0,
				more: false,
				_jsns: 'urn:zimbraAccount'
			},
			isNull
		)
	}
});

export const getLessThan100Resources = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: {
				id: 1403,
				_content: 1403
			}
		}
	},
	Body: {
		AutoCompleteGalResponse: {
			cn: map({ length: 90 }, () => ({
				id: faker.datatype.uuid(),
				fileAsStr: faker.company.name(),
				_attrs: {
					zimbraCalResType: 'Location',
					email: faker.internet.email()
				}
			})),
			sortBy: 'dateDesc',
			offset: 0,
			more: false,
			_jsns: 'urn:zimbraAccount'
		}
	}
});

const getEmptyResponse = (): SuccessSoapResponse<any> => ({
	Header: {
		context: {
			session: {
				id: 1403,
				_content: 1403
			}
		}
	},
	Body: {
		AutoCompleteGalResponse: {
			_jsns: 'urn:zimbraMail'
		}
	}
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleAutoCompleteGalRequest = (req, res, ctx) => {
	const response = getEmptyResponse();
	return res(ctx.json(response));
};
