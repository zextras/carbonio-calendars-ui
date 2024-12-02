/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect } from 'react';

import { screen } from '@testing-library/react';
import { Button, ChipAction } from '@zextras/carbonio-design-system';

import {
	EDIT_ACTION_ID,
	USER_TYPES_CONST
} from '../../../../carbonio-ui-commons/integrations/constants';
import {
	ContactInputItem,
	ContactInputProps
} from '../../../../carbonio-ui-commons/integrations/types';
import { UserEvent } from '../../../../carbonio-ui-commons/test/test-setup';

export const EDIT_ACTION: ChipAction = {
	icon: 'EditOutline',
	id: EDIT_ACTION_ID,
	label: 'Edit',
	type: 'button',
	onClick: jest.fn()
};
export const MOCK_VALUE = {
	id: '123',
	label: 'whatever',
	value: {
		id: '123',
		type: USER_TYPES_CONST.CONTACT,
		email: 'newContact@test.com',
		firstName: 'New',
		lastName: 'Contact',
		fullName: 'New Contact'
	},
	error: true,
	actions: [EDIT_ACTION]
};

export const MOCK_DL = {
	id: '123',
	label: 'whatever',
	value: {
		id: '123',
		type: USER_TYPES_CONST.DISTRIBUTION_LIST,
		email: 'newContact@test.com'
	},
	error: false,
	actions: [EDIT_ACTION]
};

export const spyDefaultValue = jest.fn();

type ContactInputBuilder = (props: ContactInputProps) => React.JSX.Element;

function mockContactInputSpy(
	newValues: ContactInputItem[]
): (props: Record<string, any>) => React.JSX.Element {
	// eslint-disable-next-line react/display-name
	return (props: Record<string, any>): React.JSX.Element => {
		useEffect(() => {
			spyDefaultValue(props.defaultValue);
		}, [props.defaultValue]);

		return (
			<Button
				onClick={(): void => props.onChange([...props.defaultValue, ...newValues])}
				data-testid={'test-button'}
			/>
		);
	};
}
export function contactInputBuilder({
	valuesToAdd = []
}: {
	valuesToAdd?: ContactInputItem[];
} = {}): ContactInputBuilder {
	return mockContactInputSpy(valuesToAdd);
}

export async function triggerOnAdd(user: UserEvent): Promise<void> {
	const testButton = await screen.findByTestId('test-button');
	await user.click(testButton);
}
