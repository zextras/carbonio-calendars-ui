/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipItem } from '@zextras/carbonio-design-system';
import { reduce, uniqBy } from 'lodash';

// TODO: use types from contact. Consider extracting them or create a @types module
import { EditorChipAttendees } from '../../../types/store/invite';

export type ContactInputAction = {
	id: string;
	label: string;
	icon: string;
	type: string;
	color?: string;
	onClick?: () => void;
};

export type ContactInputItem = {
	id?: string;
	email?: string;
	label?: string;
	fullName?: string;
	actions?: Array<ContactInputAction>;
	error?: boolean;
};

export function mapContactInputAttendees(contacts: ContactInputItem[]): EditorChipAttendees[] {
	return contacts.map((contact) => ({
		label: contact.label,
		fullName: contact.fullName,
		email: contact.email ?? 'unknown'
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
