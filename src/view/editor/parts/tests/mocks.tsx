/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { useEffect } from 'react';

import { Button, ChipAction } from '@zextras/carbonio-design-system';

import {
	EDIT_ACTION_ID,
	USER_TYPES_CONST
} from '../../../../carbonio-ui-commons/integrations/constants';
import { ContactInputItem } from '../../../../carbonio-ui-commons/integrations/types';

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

const valuesWithError: ContactInputItem[] = [
	{
		...MOCK_VALUE,
		error: true
	}
];

const valuesWithoutError: ContactInputItem[] = [
	{
		...MOCK_VALUE,
		error: false
	}
];

const valuesWithDistributionList = [MOCK_DL];

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

type ContactInputBuilder = (props: Record<string, any>) => React.JSX.Element;

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
export function contactInputBuilder(onAdd: ContactInputItem[]): ContactInputBuilder {
	return mockContactInputSpy(onAdd);
}
export function ContactInputDistributionList(props: Record<string, any>): React.JSX.Element {
	return mockContactInput(valuesWithDistributionList)(props);
}

export function ContactInputError(props: Record<string, any>): React.JSX.Element {
	return mockContactInput(valuesWithError)(props);
}
