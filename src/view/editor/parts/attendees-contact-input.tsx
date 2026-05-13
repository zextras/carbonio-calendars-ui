/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react';

import { CONTACT_TYPES, useContactInput, ContactInputItem } from '@zextras/carbonio-ui-commons';
import { isEqual } from 'lodash';

import { EditorChipAttendees } from '../../../types/store/invite';

type AttendeeContactInputProps = {
	attendees: Array<EditorChipAttendees>;
	onChange: (contactInputItems: EditorChipAttendees[]) => void;
	placeholder: string;
	disabled: boolean;
	orderedAccountIds: Array<string>;
	customDisplayAttendeeChip?: (contactInputItem: ContactInputItem) => ContactInputItem;
};
const createEditorAttendeeFromContactInput = (contact: ContactInputItem): EditorChipAttendees => ({
	label: contact.label,
	email: contact.value.email
});

const createContactChip = (attendee: EditorChipAttendees): ContactInputItem => ({
	id: attendee.email,
	label: attendee.fullName ?? attendee.label ?? attendee.email,
	value: {
		id: attendee.email,
		email: attendee.email,
		type: attendee.isGroup ? CONTACT_TYPES.DISTRIBUTION_LIST : CONTACT_TYPES.CONTACT
	}
});
export const AttendeesContactInput = ({
	placeholder,
	orderedAccountIds,
	disabled,
	attendees,
	onChange,
	customDisplayAttendeeChip,
	...rest
}: AttendeeContactInputProps): React.JSX.Element => {
	const ContactInput = useContactInput();
	const [inputState, setInputState] = useState<Record<string, ContactInputItem | undefined>>({});

	const onChangeAttendeeContact = useCallback<(items: Array<ContactInputItem>) => void>(
		(valuesFromInput) => {
			const newInputState: Record<string, ContactInputItem> = {};
			valuesFromInput.forEach((contact) => {
				newInputState[contact.value.email] = contact;
			});
			setInputState(newInputState);
			const updatedAttendees = valuesFromInput.map((contact) => {
				const currentAttendee = attendees.find(
					(attendee) => attendee.email.toLowerCase() === contact.value.email.toLowerCase()
				);
				return currentAttendee || createEditorAttendeeFromContactInput(contact);
			});
			const currentEmails = attendees
				.map((a) => a.email.toLowerCase())
				.sort((a, b) => a.localeCompare(b));
			const newEmails = updatedAttendees
				.map((a) => a.email.toLowerCase())
				.sort((a, b) => a.localeCompare(b));
			if (!isEqual(currentEmails, newEmails)) {
				onChange(updatedAttendees);
			}
		},
		[attendees, onChange]
	);

	const attendeesChips: Array<ContactInputItem> = useMemo(() => {
		const chipsToDisplay = attendees.map((attendee) => {
			const existingChip = inputState[attendee.email];
			return existingChip ?? createContactChip(attendee);
		});
		return customDisplayAttendeeChip
			? chipsToDisplay.map(customDisplayAttendeeChip)
			: chipsToDisplay;
	}, [attendees, inputState, customDisplayAttendeeChip]);

	return (
		<ContactInput
			placeholder={placeholder}
			onChange={onChangeAttendeeContact}
			defaultValue={attendeesChips}
			disabled={disabled}
			dragAndDropEnabled
			orderedAccountIds={orderedAccountIds}
			{...rest}
		/>
	);
};
