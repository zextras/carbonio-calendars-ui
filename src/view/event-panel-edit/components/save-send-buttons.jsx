/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Button, Padding } from '@zextras/zapp-ui';
import { useTranslation } from 'react-i18next';

export default function SaveSendButtons({ data, onSave, onSend, proposeNewTime }) {
	const [t] = useTranslation();
	return (
		<>
			<Button
				type="outlined"
				label={t('action.send', 'Send')}
				icon="PaperPlane"
				disabled={
					data.resource.attendees.length === 0 && data.resource.optionalAttendees.length === 0
				}
				onClick={onSend}
			/>

			<Padding left="medium">
				<Button
					label={t('label.save', 'Save')}
					icon="SaveOutline"
					disabled={!data.title || proposeNewTime}
					onClick={onSave}
				/>
			</Padding>
		</>
	);
}
