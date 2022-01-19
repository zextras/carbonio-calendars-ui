/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { size } from 'lodash';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@zextras/carbonio-design-system';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const DisplayMessage = ({
	event,
	invite,
	isInstance,
	isAskingConfirmation
}: any): ReactElement => {
	const [t] = useTranslation();
	const participantsSize = useMemo(() => size(invite?.participants), [invite]);
	const { isRecurrent, iAmOrganizer, isException } = event.resource;

	const displayMessage = useMemo(() => {
		if (isAskingConfirmation) {
			return t(
				'message.want_to_edit_cancellation_msg',
				'Do you want to edit the appointment cancellation message?'
			);
		}
		if ((isInstance && !isRecurrent) || isException) {
			if (iAmOrganizer) {
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
			if (iAmOrganizer) {
				return participantsSize > 0
					? t(
							'message.want_to_edit_cancellation_msg',
							'Do you want to edit the appointment cancellation message?'
					  )
					: t('message.you_sure_delete_instance', {
							title: event.title,
							defaultValue: `Are you sure you want to delete this instance of “{{title}}” appointment?`
					  });
			}
			return t('message.you_sure_delete_instance', {
				title: event.title,
				defaultValue: `Are you sure you want to delete this instance of “{{title}}” appointment?`
			});
		}
		// isRecurrent && !isInstance (series)
		return t(
			'message.sure_to_delete_all_occurences_appointment',
			'Are you sure you want to delete all occurrences of this appointment?'
		);
	}, [
		event.title,
		iAmOrganizer,
		isAskingConfirmation,
		isException,
		isInstance,
		isRecurrent,
		participantsSize,
		t
	]);

	return <Text overflow="break-word">{displayMessage}</Text>;
};
