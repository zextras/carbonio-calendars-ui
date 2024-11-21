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

function mapContactInputAttendees(contacts: ContactInputItem[]): EditorChipAttendees[] {
	return contacts.map((contact) => ({
		label: contact.label,
		fullName: contact.fullName,
		email: contact.email ?? 'unknown'
	}));
}

export function handleContactsChange(
	contacts: ContactInputItem[],
	setterForState: (args: Record<string, ContactInputItem>) => void,
	dispatchAction: (args: { attendees: EditorChipAttendees[] }) => any
): void {
	const attendeesToSave = mapContactInputAttendees(contacts);
	const newContactsState: Record<string, ContactInputItem> = {};
	contacts.forEach((contact) => {
		if (contact.email) {
			newContactsState[contact.email] = contact;
		}
	});
	setterForState(newContactsState);
	dispatchAction({
		attendees: attendeesToSave
	});
}

export function handleChipChange(
	chips: ChipItem<EditorChipAttendees>[],
	dispatchAction: (args: { attendees: EditorChipAttendees[] }) => any
): void {
	const attendeesToSave = uniqBy(
		reduce(
			chips,
			(acc, chip) => (chip.value ? [...acc, chip.value] : acc),
			[] as Array<EditorChipAttendees>
		),
		'email'
	);
	if (attendeesToSave.length) {
		dispatchAction({ attendees: attendeesToSave });
	}
}

export const onAddChipInput = (valueToAdd: unknown): ChipItem<EditorChipAttendees> => {
	if (valueToAdd && typeof valueToAdd === 'string') {
		return { label: valueToAdd, value: { email: valueToAdd } };
	}
	throw new Error('invalid keywords received');
};
