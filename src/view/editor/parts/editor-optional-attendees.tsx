/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react';

import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import {
	applyAttendeeToContactInputItem,
	createEditorAttendeeFromContactInput
} from './attendees-utils';
import { useContactInput } from '../../../carbonio-ui-commons/integrations/hooks';
import { ContactInputItem } from '../../../carbonio-ui-commons/integrations/types';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorDisabled,
	selectEditorOptionalAttendees
} from '../../../store/selectors/editor';
import { editEditorOptionalAttendees } from '../../../store/slices/editor-slice';

export const EditorOptionalAttendees = ({
	editorId,
	orderedAccountIds
}: {
	editorId: string;
	orderedAccountIds: Array<string>;
}): React.JSX.Element => {
	const [t] = useTranslation();
	const ContactInput = useContactInput();
	const dispatch = useAppDispatch();
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const [optionalContactsState, setOptionalContactsState] = useState<
		Record<string, ContactInputItem | undefined>
	>({});

	const onChangeOptionalContact = useCallback<(items: Array<ContactInputItem>) => void>(
		(contacts) => {
			const newContactsState: Record<string, ContactInputItem> = {};
			contacts.forEach((contact) => {
				newContactsState[contact.value.email] = contact;
			});
			setOptionalContactsState(newContactsState);
			const newOptionalAttendees = contacts.map((contact) => {
				const currentAttendee = optionalAttendees.find(
					(attendee) => attendee.email === contact.value.email
				);
				return currentAttendee || createEditorAttendeeFromContactInput(contact);
			});
			dispatch(
				editEditorOptionalAttendees({
					id: editorId,
					optionalAttendees: newOptionalAttendees
				})
			);
		},
		[dispatch, editorId, optionalAttendees]
	);

	const optionalAttendeesContactInputValues: Array<ContactInputItem> = useMemo(() => {
		if (optionalAttendees?.length > 0) {
			return map(optionalAttendees, (optionalAttendee) => {
				const storedValue = optionalContactsState[optionalAttendee.email];

				return applyAttendeeToContactInputItem(optionalAttendee, storedValue);
			});
		}
		return [];
	}, [optionalContactsState, optionalAttendees]);

	return (
		<ContactInput
			data-testid={'optional-attendees-chip-input'}
			placeholder={t('label.optionals', 'Optionals')}
			onChange={onChangeOptionalContact}
			defaultValue={optionalAttendeesContactInputValues}
			disabled={disabled?.optionalAttendees}
			dragAndDropEnabled
			orderedAccountIds={orderedAccountIds}
		/>
	);
};
