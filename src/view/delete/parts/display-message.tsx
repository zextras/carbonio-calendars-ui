/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { size } from 'lodash';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@zextras/carbonio-design-system';
import { Invite } from '../../../types/store/invite';

type DisplayMessageProps = {
	invite: Invite;
	isInstance?: boolean;
	isAskingConfirmation: boolean;
};

export const DisplayMessage = ({
	invite,
	isInstance,
	isAskingConfirmation
}: DisplayMessageProps): ReactElement => {
	const [t] = useTranslation();
	const participantsSize = useMemo(() => size(invite?.participants), [invite]);
	const { isOrganizer, isException } = invite;
	const isRecurrent = !!invite.recurrenceRule;

	const displayMessage = useMemo(() => {
		if (isAskingConfirmation) {
			return t(
				'message.want_to_edit_cancellation_msg',
				'Do you want to edit the appointment cancellation message?'
			);
		}
		if ((isInstance && !isRecurrent) || isException) {
			if (isOrganizer) {
				return participantsSize > 0
					? t(
							'message.want_to_edit_cancellation_msg',
							'Do you want to edit the appointment cancellation message?'
					  )
					: t(
							'message.sure_to_delete_appointment',
							'Are you sure you want to delete the appointment ?'
					  );
			}
			return t(
				'message.sure_to_delete_appointment',
				'Are you sure you want to delete the appointment ?'
			);
		}
		if (isRecurrent && isInstance) {
			if (isOrganizer) {
				return participantsSize > 0
					? t(
							'message.want_to_edit_cancellation_msg',
							'Do you want to edit the appointment cancellation message?'
					  )
					: t('message.you_sure_delete_instance', {
							title: invite.name,
							defaultValue: `Are you sure you want to delete this instance of “{{title}}” appointment?`
					  });
			}
			return t('message.you_sure_delete_instance', {
				title: invite.name,
				defaultValue: `Are you sure you want to delete this instance of “{{title}}” appointment?`
			});
		}
		// isRecurrent && !isInstance (series)
		return t(
			'message.sure_to_delete_all_occurences_appointment',
			'Are you sure you want to delete all occurrences of this appointment?'
		);
	}, [
		invite.name,
		isOrganizer,
		isAskingConfirmation,
		isException,
		isInstance,
		isRecurrent,
		participantsSize,
		t
	]);

	return <Text overflow="break-word">{displayMessage}</Text>;
};
