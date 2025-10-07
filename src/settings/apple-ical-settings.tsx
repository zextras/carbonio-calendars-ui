/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import {
	Text,
	Row,
	Checkbox,
	FormSection,
	FormSubSection,
	Container
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { AccountSettingsPrefs } from '@zextras/carbonio-ui-soap-lib';

import { iCalSubSection } from './sub-sections';

export default function AppleIcalSettings({
	settingsObj,
	updateSettings
}: {
	settingsObj: AccountSettingsPrefs;
	updateSettings: (e: {
		target: {
			name: string;
			value: string;
		};
	}) => void;
}): React.JSX.Element {
	const sectionTitleAppleCal = useMemo(() => iCalSubSection(), []);
	return (
		<FormSection id={sectionTitleAppleCal.id} label={sectionTitleAppleCal.label}>
			<FormSubSection>
				<Container orientation="horizontal" crossAlignment="baseline" mainAlignment="flex-start">
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
				<Checkbox
					value={settingsObj.zimbraPrefAppleIcalDelegationEnabled === 'TRUE'}
					label={t('label.enable_dlgtn_for_ical', 'Enable delegation for Apple iCal CalDAV Client')}
					onClick={(): void =>
						updateSettings({
							target: {
								name: 'zimbraPrefAppleIcalDelegationEnabled',
								value:
									settingsObj.zimbraPrefAppleIcalDelegationEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
			</FormSubSection>
		</FormSection>
	);
}
