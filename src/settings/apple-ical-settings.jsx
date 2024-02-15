/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Text, Row, Checkbox } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

export default function AppleIcalSettings({ settingsObj, updateSettings }) {
	return (
		<Container
			padding={{ all: 'medium' }}
			background="gray6"
			mainAlignment="baseline"
			crossAlignment="baseline"
		>
			<Container
				orientation="horizontal"
				crossAlignment="baseline"
				mainAlignment="baseline"
				padding={{ all: 'small' }}
			>
				<Row padding={{ right: 'small' }}>
					<Text weight="bold">Note:</Text>
				</Row>
				<Row>
					<Text overflow="break-word">
						{t(
							'settings.ical_note',
							"Apple iCal can be configured to access your Calendars using the CalDAV protocol.When this preference is enabled,shared calendars are displayed in the ical account's Delegation tab so you can delegate access to your Calendars to other users."
						)}
					</Text>
				</Row>
			</Container>
			<Row padding="small">
				<Checkbox
					value={settingsObj.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
					label={t('label.enable_dlgtn_for_ical', 'Enable delegation for Apple iCal CalDAV Client')}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefAppleIcalDelegationEnabled',
								value:
									settingsObj.zimbraPrefAppleIcalDelegationEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
			</Row>
		</Container>
	);
}
