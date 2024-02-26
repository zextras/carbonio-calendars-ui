/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement } from 'react';

import { Container, Text, Padding, useSnackbar } from '@zextras/carbonio-design-system';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { Trans, useTranslation } from 'react-i18next';

import { UrlColumn } from './url-column';
import { ModalHeader } from '../../../../commons/modal-header';
import { ShareCalendarUrlProps } from '../../../../types/share-calendar';

const getUrl = (type: string, user: string, folderName: string): string => {
	const domain = window.location.hostname;
	return type === 'ics'
		? `https://${domain}/home/${user}/${folderName}.ics`
		: `webcals://${domain}/home/${user}/${folderName}`;
};
const ShareCalendarUrl: FC<ShareCalendarUrlProps> = ({
	folderName,
	onClose,
	isFromEditModal
}): ReactElement => {
	const createSnackbar = useSnackbar();
	const accounts = useUserAccounts();

	const [t] = useTranslation();

	const onUrlCopied = (title: string, type: string) => (): void => {
		const text = getUrl(type, accounts[0].name, folderName);
		navigator.clipboard.writeText(text).then(() => {
			createSnackbar({
				key: `folder-action-success`,
				replace: true,
				type: 'success',
				hideButton: true,
				label: t('snackbar.url_copied', { title, defaultValue: '{{title}} copied' }),
				autoHideTimeout: 3000
			});
		});
	};
	return (
		<Container padding="0.5rem 0.5rem 1.5rem">
			<ModalHeader
				title={t('label.share_calendar_url', {
					title: folderName,
					defaultValue: '{{title}} access share'
				})}
				onClose={onClose}
			/>
			<Container padding={{ vertical: 'medium' }}>
				<Container crossAlignment="baseline">
					<Text overflow="break-word">
						{t('message.share_calendar_url_msg', {
							title: folderName,
							defaultValue:
								'You can quickly share {{title}} with your collaborators using one of these URLs:'
						})}
					</Text>
				</Container>
				<Padding top="large" />
				<Container orientation="horizontal" padding={{ horizontal: 'medium', vertical: 'large' }}>
					<UrlColumn
						label={t('label.ics_url', 'ICS URL')}
						onUrlCopied={onUrlCopied}
						tooltip={t('tooltip.copy_ics_url', 'Copy ICS url')}
						type="ics"
					/>
					<UrlColumn
						label={t('label.outlook_url', 'Outlook URL')}
						tooltip={t('tooltip.copy_outlook_url', 'Copy Outlook url')}
						onUrlCopied={onUrlCopied}
						type="outlook"
					/>
				</Container>
				<Container crossAlignment="center" mainAlignment="center">
					<Text overflow="break-word" color="secondary">
						{isFromEditModal ? (
							<Trans
								i18nKey="message.share_calendar_url_note2"
								defaults="Only your collaborators can access your data using these URLs.<br/> You can find these links also right-clicking your calendars list."
							/>
						) : (
							t(
								'message.share_calendar_url_note',
								'Only your collaborators can access your data using these URLs.'
							)
						)}
					</Text>
				</Container>
			</Container>
		</Container>
	);
};

export default ShareCalendarUrl;
