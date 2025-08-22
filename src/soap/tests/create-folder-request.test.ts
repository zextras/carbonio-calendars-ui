/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { createFolderRequest } from 'soap/create-folder-request';
import { generateApiErrorResponse } from 'test/generators/api';
import { CreateFolderRequest, CreateFolderResponse, RequestFolder } from 'types/soap/createFolder';

const response: CreateFolderResponse = {
	folder: [
		{
			color: 4,
			f: '#',
			id: '0000',
			l: '1',
			name: 'testfolder',
			uuid: 'cae43c2d-811d-4be8-a59e-f22d3fd35f55',
			view: 'appointment',
			activesyncdisabled: false,
			recursive: false,
			deletable: true
		}
	],
	_jsns: JSNS.mail
};

const reqActionParams: RequestFolder = {
	color: 1,
	f: 'b#',
	l: '1',
	name: 'folderName',
	view: 'appointment'
};

describe('createFolderRequest', () => {
	it('should call the create folder API with the correct parameters', async () => {
		const apiCallInterceptor = createSoapAPIInterceptor<CreateFolderRequest, CreateFolderResponse>(
			'CreateFolder',
			response
		);

		await createFolderRequest(reqActionParams);
		const apiParams = await apiCallInterceptor;

		expect(apiParams).toEqual({
			folder: reqActionParams,
			_jsns: JSNS.mail
		});
	});

	it('should raise an error if the API call fails', async () => {
		const faultyResponse = generateApiErrorResponse();
		createSoapAPIInterceptor<CreateFolderRequest, ErrorSoapBodyResponse>(
			'CreateFolder',
			faultyResponse
		);

		expect(createFolderRequest(reqActionParams)).rejects.toThrow(faultyResponse.Fault.Reason.Text);
	});
});
