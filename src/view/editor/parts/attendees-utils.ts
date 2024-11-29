/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipItem } from '@zextras/carbonio-design-system';
import { reduce, reject, uniqBy } from 'lodash';

import { USER_TYPES_CONST } from '../../../carbonio-ui-commons/integrations/constants';
import { ContactInputItem } from '../../../carbonio-ui-commons/integrations/types';

// TODO: use types from contact. Consider extracting them or create a @types module
import { EditorChipAttendees } from '../../../types/store/invite';

export function getContactInputEmail(contact: ContactInputItem): string {
	return contact.value.email;
}

function mapContactInputToEditorAttendee(contact: ContactInputItem): EditorChipAttendees {
	const commonFields = { label: contact.label, email: getContactInputEmail(contact) };
	if (contact.value.type === USER_TYPES_CONST.DISTRIBUTION_LIST) {
		return commonFields;
	}
	return {
		...commonFields,
		fullName: contact.value.fullName
	};
}

export function mapContactInputAttendees(contacts: ContactInputItem[]): EditorChipAttendees[] {
	return contacts.map(mapContactInputToEditorAttendee);
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

const defaultContactChip = (attendee: EditorChipAttendees): ContactInputItem => ({
	id: attendee.email,
	label: attendee.email,
	value: {
		id: attendee.email,
		email: attendee.email,
		type: attendee.isGroup ? USER_TYPES_CONST.DISTRIBUTION_LIST : USER_TYPES_CONST.CONTACT
	}
});

export function applyAttendeeToContactInputItem(
	attendee: EditorChipAttendees,
	chip: ContactInputItem | undefined
): ContactInputItem {
	if (!chip) {
		return defaultContactChip(attendee);
	}
	return {
		...chip,
		actions:
			chip?.actions && !chip?.error ? reject(chip?.actions, ['icon', 'EditOutline']) : chip?.actions
	};
}
