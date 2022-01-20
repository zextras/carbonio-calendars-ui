/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { Container, SnackbarManagerContext, Text, Padding } from '@zextras/carbonio-design-system';
import { ShareCalendarUrlProps } from '../../../../types/share-calendar';
import { ModalHeader } from '../../../../commons/modal-header';
import { UrlColumn } from './url-column';

const getUrl = (type: string, user: string, folderName: string): string => {
	switch (type) {
		case 'ics':
			return `https://mail.zextras.com/home/${user}/${folderName}.ics`;
		case 'html':
			return `https://mail.zextras.com/home/${user}/${folderName}.html`;
		default:
			return `webcals://mail.zextras.com/home/${user}/${folderName}`;
	}
};
const ShareCalendarUrl: FC<ShareCalendarUrlProps> = ({
	folder,
	onClose,
	isFromEditModal
}): ReactElement => {
	const createSnackbar = useContext(SnackbarManagerContext);
	const accounts = useUserAccounts();

	const [t] = useTranslation();

	const onUrlCopied = (title: string, type: string) => (): void => {
		const text = getUrl(type, accounts[0].name, folder.name);
		navigator.clipboard.writeText(text).then(() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
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
		<Container padding="8px 8px 24px">
			<ModalHeader
				title={t('label.share_calendar_url', {
					title: folder.name,
					defaultValue: '{{title}} access share'
				})}
				onClose={onClose}
			/>
			<Container padding={{ vertical: 'medium' }}>
				<Container crossAlignment="baseline">
					<Text overflow="break-word">
						{t('message.share_calendar_url_msg', {
							title: folder.name,
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
						label={t('label.view_url', 'View URL')}
						tooltip={t('tooltip.copy_vector_url', 'Copy View url')}
						onUrlCopied={onUrlCopied}
						type="html"
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
