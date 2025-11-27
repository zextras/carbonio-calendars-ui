/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse, JSNS } from '@zextras/carbonio-shell-ui';

import { TEST_SELECTORS } from '../../../constants/test-utils';
import {
	DeleteCalendarGroupRequest,
	DeleteCalendarGroupResponse
} from '../../../soap/delete-calendar-group-request';
import { generateSoapErrorResponseBody } from '../../../test/generators/utils';
import { DeleteCalendarGroupModal } from '../delete-calendar-group-modal';
import { setupTest, screen } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('DeleteCalendarGroupModal', () => {
	it('should render the specific title ', () => {
		setupTest(<DeleteCalendarGroupModal groupId={'1'} onClose={vi.fn()} />);

		expect(screen.getByText('Delete group permanently?')).toBeVisible();
	});

	it('should render the close icon ', () => {
		setupTest(<DeleteCalendarGroupModal groupId={'1'} onClose={vi.fn()} />);

		expect(
			screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal })
		).toBeVisible();
	});

	it('calls onClose when the close icon is clicked', async () => {
		const onClose = vi.fn();

		const { user } = setupTest(<DeleteCalendarGroupModal groupId={'1'} onClose={onClose} />);
		await user.click(screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.closeModal }));

		expect(onClose).toHaveBeenCalled();
	});

	it('should call onClose when the delete button is clicked', async () => {
		const onClose = vi.fn();
		const groupId = faker.number.int().toString();
		const response = {
			group: {
				id: groupId
			},
			_jsns: JSNS.mail
		};

		createSoapAPIInterceptor<DeleteCalendarGroupRequest, DeleteCalendarGroupResponse>(
			'DeleteCalendarGroup',
			response
		);
		const { user } = setupTest(<DeleteCalendarGroupModal groupId={groupId} onClose={onClose} />);
		await act(() => user.click(screen.getByRole('button', { name: /delete permanently/i })));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should call the deletion API when the delete button is clicked', async () => {
		const groupId = faker.number.int().toString();
		const response = {
			group: {
				id: groupId
			},
			_jsns: JSNS.mail
		};

		const apiCallInterceptor = createSoapAPIInterceptor<
			DeleteCalendarGroupRequest,
			DeleteCalendarGroupResponse
		>('DeleteCalendarGroup', response);

		const { user } = setupTest(<DeleteCalendarGroupModal groupId={groupId} onClose={vi.fn()} />);
		await user.click(screen.getByRole('button', { name: /delete permanently/i }));
		const apiParams = await apiCallInterceptor;

		expect(apiParams).toEqual(expect.objectContaining({ id: groupId }));
	});

	it('should render a success snackbar when the API call is successful', async () => {
		const groupId = faker.number.int().toString();
		const response = {
			group: {
				id: groupId
			},
			_jsns: JSNS.mail
		};

		createSoapAPIInterceptor<DeleteCalendarGroupRequest, DeleteCalendarGroupResponse>(
			'DeleteCalendarGroup',
			response
		);

		const { user } = setupTest(<DeleteCalendarGroupModal groupId={groupId} onClose={vi.fn()} />);
		await user.click(screen.getByRole('button', { name: /delete permanently/i }));

		expect(await screen.findByText('Calendar group permanently deleted')).toBeVisible();
	});

	it('should render an error snackbar when the API call fails', async () => {
		const groupId = faker.number.int().toString();
		const response = generateSoapErrorResponseBody();

		createSoapAPIInterceptor<DeleteCalendarGroupRequest, ErrorSoapBodyResponse>(
			'DeleteCalendarGroup',
			response
		);

		const { user } = setupTest(<DeleteCalendarGroupModal groupId={groupId} onClose={vi.fn()} />);
		await user.click(screen.getByRole('button', { name: /delete permanently/i }));

		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});
});
