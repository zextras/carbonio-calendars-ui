/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo } from 'react';

import { Container, Text, useSnackbar, Tooltip, Button } from '@zextras/carbonio-design-system';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { copyToClipboard } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { CALENDARS_SHARE_LINK_TYPES } from '../../../../constants/calendar';
import { createCalendarShareURL } from '../../../../utils/calendars-share';
import { getCarbonioDomain } from '../../../../utils/domain';

type ShareCalendarUrlsProps = {
	calendarName: string;
};

export const ShareCalendarUrls: FC<ShareCalendarUrlsProps> = ({ calendarName }): ReactElement => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const accounts = useUserAccounts();

	const user = useMemo(() => accounts[0].name, [accounts]);
	const domain = useMemo(() => getCarbonioDomain(), []);
	const icsLinkLabel = useMemo(() => t('label.ics_url', 'ICS URL'), [t]);
	const webcalLinkLabel = useMemo(() => t('label.webcal_url', 'WebCAL URL'), [t]);
	const caldavLinkLabel = useMemo(() => t('label.caldav_url', 'CalDAV URL'), [t]);

	const createLinkClickHandler = useCallback(
		(urlTitle: string, type: keyof typeof CALENDARS_SHARE_LINK_TYPES) => (): void => {
			const url = createCalendarShareURL(type, {
				calendarName,
				user,
				domain
			});
			copyToClipboard(url).then(() => {
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					severity: 'success',
					hideButton: true,
					label: t('snackbar.url_copied', { title: urlTitle, defaultValue: '{{title}} copied' }),
					autoHideTimeout: 3000
				});
			});
		},
		[calendarName, createSnackbar, domain, t, user]
	);

	return (
		<>
			<Container orientation="horizontal" mainAlignment="flex-start" gap={'0.5rem'}>
				<Tooltip label={t('tooltip.copy_ics_url', 'Copy ICS url')} placement="top">
					<Button
						label={icsLinkLabel}
						icon="Copy"
						size="small"
						type="outlined"
						onClick={createLinkClickHandler(icsLinkLabel, CALENDARS_SHARE_LINK_TYPES.ics)}
					/>
				</Tooltip>

				<Tooltip label={t('tooltip.copy_webcal_url', 'Copy WebCAL url')} placement="top">
					<Button
						label={webcalLinkLabel}
						icon="Copy"
						size="small"
						type="outlined"
						onClick={createLinkClickHandler(webcalLinkLabel, CALENDARS_SHARE_LINK_TYPES.webcal)}
					/>
				</Tooltip>

				<Tooltip label={t('tooltip.copy_caldav_url', 'Copy CalDAV url')} placement="top">
					<Button
						label={caldavLinkLabel}
						icon="Copy"
						size="small"
						type="outlined"
						onClick={createLinkClickHandler(caldavLinkLabel, CALENDARS_SHARE_LINK_TYPES.caldav)}
					/>
				</Tooltip>
			</Container>

			<Text overflow="break-word" color="secondary">
				{t('label.share_note', 'Anyone with these links can view your calendar.')}
			</Text>
		</>
	);
};
