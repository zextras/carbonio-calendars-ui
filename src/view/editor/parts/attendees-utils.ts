/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { reject } from 'lodash';

import { CONTACT_TYPES } from '../../../carbonio-ui-commons/integrations/constants';
import { ContactInputItem } from '../../../carbonio-ui-commons/integrations/types';

// TODO: use types from contact. Consider extracting them or create a @types module
import { EditorChipAttendees } from '../../../types/store/invite';

export function createEditorAttendeeFromContactInput(
	contact: ContactInputItem
): EditorChipAttendees {
	return { label: contact.label, email: contact.value.email };
}

const createContactChip = (attendee: EditorChipAttendees): ContactInputItem => ({
	id: attendee.email,
	label: attendee.email,
	value: {
		id: attendee.email,
		email: attendee.email,
		type: attendee.isGroup ? CONTACT_TYPES.DISTRIBUTION_LIST : CONTACT_TYPES.CONTACT
	}
});

export function applyAttendeeToContactInputItem(
	attendee: EditorChipAttendees,
	chip: ContactInputItem | undefined
): ContactInputItem {
	if (!chip) {
		return createContactChip(attendee);
	}
	return {
		...chip,
		actions:
			chip?.actions && !chip?.error ? reject(chip?.actions, ['icon', 'EditOutline']) : chip?.actions
	};
}
