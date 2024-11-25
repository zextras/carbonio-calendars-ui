/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/carbonio-design-system';
import React from 'react';
import { useEffect } from 'react';

export const EDIT_ACTION = { icon: 'EditOutline', id: 'edit', label: 'Edit', type: 'edit' };

const valuesWithError = [
	{
		id: '123',
		label: 'whatever',
		email: 'newContact@test.com',
		firstName: 'New',
		lastName: 'Contact',
		fullName: 'New Contact',
		error: true,
		actions: [EDIT_ACTION]
	}
];

const valuesWithoutError = [
	{
		id: '123',
		label: 'whatever',
		email: 'newContact@test.com',
		firstName: 'New',
		lastName: 'Contact',
		fullName: 'New Contact',
		error: false,
		actions: [EDIT_ACTION]
	}
];

const valuesWithGroup = [
	{
		id: '123',
		email: undefined,
		error: false,
		actions: [EDIT_ACTION],
		isGroup: true,
		groupId: '456',
		display: 'group 456'
	}
];

const valuesWithDistributionList = [
	{
		company: undefined,
		display: undefined,
		email: 'prova@zextras.com',
		error: false,
		firstName: undefined,
		fullName: 'DL di test',
		groupId: undefined,
		id: 'undefined prova@zextras.com',
		isGroup: true,
		label: 'prova@zextras.com',
		lastName: undefined,
		actions: [EDIT_ACTION]
	}
];

export const spyDefaultValue = jest.fn();

function mockContactInput(values: any): (props: Record<string, any>) => React.JSX.Element {
	// eslint-disable-next-line react/display-name
	return (props: Record<string, any>): React.JSX.Element => {
		useEffect(() => {
			spyDefaultValue(props.defaultValue);
		}, [props.defaultValue]);

		return <Button onClick={(): void => props.onChange(values)} data-testid={'test-button'} />;
	};
}

export function ContactInput(props: Record<string, any>): React.JSX.Element {
	return mockContactInput(valuesWithoutError)(props);
}

export function ContactInputGroup(props: Record<string, any>): React.JSX.Element {
	return mockContactInput(valuesWithGroup)(props);
}

export function ContactInputDistributionList(props: Record<string, any>): React.JSX.Element {
	return mockContactInput(valuesWithDistributionList)(props);
}

export function ContactInputError(props: Record<string, any>): React.JSX.Element {
	return mockContactInput(valuesWithError)(props);
}
