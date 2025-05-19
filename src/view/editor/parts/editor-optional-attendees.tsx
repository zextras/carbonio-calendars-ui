/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { AttendeesContactInput } from './attendees-contact-input';
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
	const dispatch = useAppDispatch();
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const onChangeOptionalContact = useCallback<
		(updatedOptionalAttendees: Array<EditorChipAttendees>) => void
	>(
		(updatedOptionalAttendees) => {
			dispatch(
				editEditorOptionalAttendees({
					id: editorId,
					optionalAttendees: updatedOptionalAttendees
				})
			);
		},
		[dispatch, editorId]
	);

	return (
		<AttendeesContactInput
			data-testid={'optional-attendees-chip-input'}
			placeholder={t('label.optionals', 'Optionals')}
			onChange={onChangeOptionalContact}
			disabled={disabled?.optionalAttendees ?? false}
			attendees={optionalAttendees}
			orderedAccountIds={orderedAccountIds}
		/>
	);
};
