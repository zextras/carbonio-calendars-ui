/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipItem } from '@zextras/carbonio-design-system';
import { reduce, reject, uniqBy } from 'lodash';

// TODO: use types from contact. Consider extracting them or create a @types module
import { EditorChipAttendees } from '../../../types/store/invite';

type USER_TYPES = {
	GROUP: 'CONTACT_GROUP';
	DISTRIBUTION_LIST: 'DISTRIBUTION_LIST';
	CONTACT: 'CONTACT';
};

export const USER_TYPES: USER_TYPES = {
	GROUP: 'CONTACT_GROUP',
	DISTRIBUTION_LIST: 'DISTRIBUTION_LIST',
	CONTACT: 'CONTACT'
};

export type UserContactGroup = {
	id: string;
	display: string;
	groupId: string;
	type: USER_TYPES['GROUP'];
};

export type UserDistributionList = {
	id: string;
	email: string;
	type: USER_TYPES['DISTRIBUTION_LIST'];
};

export type UserContact = {
	id: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	fullName?: string;
	company?: string;
	email: string;
	type: USER_TYPES['CONTACT'];
};
export type ContactInputItemValue = UserContactGroup | UserDistributionList | UserContact;

export type ContactInputItem = ChipItem<ContactInputItemValue> &
	Required<Pick<ChipItem<ContactInputItemValue>, 'label'>> &
	Required<Pick<ChipItem<ContactInputItemValue>, 'value'>>;

export type ContactInputAction = {
	id: string;
	label: string;
	icon: string;
	type: string;
	color?: string;
	onClick?: () => void;
};

// export type ContactInputItem = {
// 	id: string;
// 	email?: string;
// 	label?: string;
// 	fullName?: string;
// 	firstName?: string;
// 	lastName?: string;
// 	actions?: Array<ContactInputAction>;
// 	error?: boolean;
// 	groupId?: string;
// 	isGroup?: boolean;
// 	display?: string;
// };

export function getContactInputEmail(contact: ContactInputItemValue): string {
	return contact.type === USER_TYPES.GROUP ? contact.id : contact.email;
}

export function mapContactInputAttendees(contacts: ContactInputItem[]): EditorChipAttendees[] {
	return contacts.map((contact) => ({
		label: contact.label,
		fullName: contact?.value?.fullName,
		email: getContactInputEmail(contact.value)
	}));
}

export function filterValidChips(
	chips: ChipItem<EditorChipAttendees>[]
): Array<EditorChipAttendees> {
	return uniqBy(
		reduce(
			chips,
			(acc, chip) => (chip.value ? [...acc, chip.value] : acc),
			[] as Array<EditorChipAttendees>
		),
		'email'
	);
}

export const validateChipInput = (valueToAdd: unknown): ChipItem<EditorChipAttendees> => {
	if (valueToAdd && typeof valueToAdd === 'string') {
		return { label: valueToAdd, value: { email: valueToAdd } };
	}
	throw new Error('invalid keywords received');
};

export function applyAttendeeToContactInputItem(
	attendee: EditorChipAttendees,
	chip: ContactInputItem
): ContactInputItem {
	const label = chip ? chip.label : attendee.email;
	return {
		...chip,
		label,
		value: chip?.value ?? {
			email: attendee.email,
			id: attendee.email,
			type: USER_TYPES.CONTACT
		},
		id: attendee.email,
		actions:
			chip?.actions && !chip?.error ? reject(chip?.actions, ['icon', 'EditOutline']) : chip?.actions
	};
}
