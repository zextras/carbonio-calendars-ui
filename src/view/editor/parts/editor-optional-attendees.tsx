/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react';

import { ChipInput, ChipInputProps, ChipItem } from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';

import {
	applyAttendeeToContactInputItem,
	createEditorAttendeeFromContactInput,
	filterValidChips,
	getContactInputEmail,
	validateChipInput
} from './attendees-utils';
import { ContactInputItem } from '../../../carbonio-ui-commons/integrations/types';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorDisabled,
	selectEditorOptionalAttendees
} from '../../../store/selectors/editor';
import { editEditorOptionalAttendees } from '../../../store/slices/editor-slice';
import { EditorChipAttendees } from '../../../types/store/invite';

export const EditorOptionalAttendees = ({
	editorId,
	orderedAccountIds
}: {
	editorId: string;
	orderedAccountIds: Array<string>;
}): React.JSX.Element => {
	const [t] = useTranslation();
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const dispatch = useAppDispatch();
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const [optionalContactsState, setOptionalContactsState] = useState<
		Record<string, ContactInputItem | undefined>
	>({});

	const optionalHasError = useMemo(
		() => some(optionalAttendees ?? [], { error: true }),
		[optionalAttendees]
	);
	const onChangeOptionalChip = useCallback<
		NonNullable<ChipInputProps<EditorChipAttendees>['onChange']>
	>(
		(chips) => {
			const newAttendees = filterValidChips(chips);
			dispatch(editEditorOptionalAttendees({ id: editorId, optionalAttendees: newAttendees }));
		},
		[dispatch, editorId]
	);

	const onChangeOptionalContact = useCallback<(items: Array<ContactInputItem>) => void>(
		(contacts) => {
			const newContactsState: Record<string, ContactInputItem> = {};
			contacts.forEach((contact) => {
				newContactsState[getContactInputEmail(contact)] = contact;
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
		[dispatch, editorId]
	);
	const optionalAttendeesChipInputValues: ChipItem<EditorChipAttendees>[] = useMemo(
		() =>
			map(optionalAttendees, (optionalAttendee) => ({
				label: optionalAttendee.email,
				value: optionalAttendee
			})),
		[optionalAttendees]
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
		<>
			{integrationAvailable ? (
				<ContactInput
					placeholder={t('label.optionals', 'Optionals')}
					onChange={onChangeOptionalContact}
					defaultValue={optionalAttendeesContactInputValues}
					disabled={disabled?.optionalAttendees}
					dragAndDropEnabled
					orderedAccountIds={orderedAccountIds}
				/>
			) : (
				<ChipInput
					data-testid={'optional-attendees-chip-input'}
					placeholder={t('label.optionals', 'Optionals')}
					background={'gray5'}
					onChange={onChangeOptionalChip}
					onAdd={validateChipInput}
					defaultValue={optionalAttendeesChipInputValues}
					hasError={optionalHasError}
					description={optionalHasError ? '' : undefined}
					disabled={disabled?.optionalAttendees}
				/>
			)}
		</>
	);
};
