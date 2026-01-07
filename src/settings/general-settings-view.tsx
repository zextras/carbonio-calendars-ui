/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import {
	Text,
	Checkbox,
	Select,
	Input,
	FormSubSection,
	FormSection,
	Container
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { AccountSettingsPrefs } from '@zextras/carbonio-ui-soap-lib';
import { find } from 'lodash';

import {
	ShowReminderOptions,
	DefaultViewOptions,
	StartWeekOfOptions,
	DefaultApptVisibiltyOptions,
	SpanTimeOptions
} from './components/utils';
import { generalSubSection } from './sub-sections';

export default function GeneralSettings({
	settingsObj,
	updateSettings,
	isEmailNotValid,
	setIsEmailNotValid
}: {
	settingsObj: AccountSettingsPrefs;
	updateSettings: (e: {
		target: {
			name: string;
			value: string;
		};
	}) => void;
	isEmailNotValid: boolean;
	setIsEmailNotValid: React.Dispatch<React.SetStateAction<boolean>>;
}): React.JSX.Element {
	const sectionTitleGeneral = useMemo(() => generalSubSection(), []);
	const showReminderOptions = useMemo(() => ShowReminderOptions(), []);
	const defaultViewOptions = useMemo(() => DefaultViewOptions(), []);
	const startWeekOfOptions = useMemo(() => StartWeekOfOptions(), []);
	const spanTimeOptions = useMemo(
		() => SpanTimeOptions(settingsObj.zimbraPrefCalendarDefaultApptDuration.includes('m')),
		[settingsObj.zimbraPrefCalendarDefaultApptDuration]
	);
	const defaultApptVisibiltyOptions = useMemo(() => DefaultApptVisibiltyOptions(), []);

	const defaultViewSelection = useMemo(
		() =>
			find(defaultViewOptions, (item) => item.value === settingsObj.zimbraPrefCalendarInitialView),
		[defaultViewOptions, settingsObj.zimbraPrefCalendarInitialView]
	);

	const startWeekSelection = useMemo(
		() =>
			find(
				startWeekOfOptions,
				(item) => item.value === settingsObj.zimbraPrefCalendarFirstDayOfWeek
			),
		[startWeekOfOptions, settingsObj.zimbraPrefCalendarFirstDayOfWeek]
	);

	const defaultApptVisibiltySelection = useMemo(
		() =>
			find(
				defaultApptVisibiltyOptions,
				(item) => item.value === settingsObj.zimbraPrefCalendarApptVisibility
			),
		[defaultApptVisibiltyOptions, settingsObj.zimbraPrefCalendarApptVisibility]
	);
	const showReminderSelection = useMemo(
		() =>
			find(
				showReminderOptions,
				(item) => item.value === settingsObj.zimbraPrefCalendarApptReminderWarningTime
			),
		[settingsObj.zimbraPrefCalendarApptReminderWarningTime, showReminderOptions]
	);
	const spanTimeSelection = useMemo(
		() =>
			find(
				spanTimeOptions,
				(item) => item.value === settingsObj.zimbraPrefCalendarDefaultApptDuration
			),
		[settingsObj.zimbraPrefCalendarDefaultApptDuration, spanTimeOptions]
	);

	return (
		<FormSection id={sectionTitleGeneral.id} label={sectionTitleGeneral.label}>
			<FormSubSection>
				<Container gap={'0.5rem'} mainAlignment={'flex-start'} crossAlignment={'flex-start'}>
					<Select
						label={t('label.default_view', 'Default view')}
						items={defaultViewOptions}
						onChange={(view): void => {
							if (view) {
								updateSettings({ target: { name: 'zimbraPrefCalendarInitialView', value: view } });
							}
						}}
						defaultSelection={defaultViewSelection}
					/>
					<Select
						label={t('label.start_week_on', 'Start week on')}
						items={startWeekOfOptions}
						onChange={(day): void => {
							if (day) {
								updateSettings({
									target: { name: 'zimbraPrefCalendarFirstDayOfWeek', value: day }
								});
							}
						}}
						defaultSelection={startWeekSelection}
					/>
					<Select
						label={t('label.default_appt_vsblty', 'Default appointment visibility')}
						items={defaultApptVisibiltyOptions}
						onChange={(mode): void => {
							if (mode) {
								updateSettings({
									target: { name: 'zimbraPrefCalendarApptVisibility', value: mode }
								});
							}
						}}
						defaultSelection={defaultApptVisibiltySelection}
					/>
				</Container>
				<Container gap={'0.5rem'} mainAlignment={'flex-start'} crossAlignment={'flex-start'}>
					<Checkbox
						value={settingsObj.zimbraPrefCalendarAutoAddInvites === 'TRUE'}
						label={t(
							'label.auto_add_rcvd_app',
							'Automatically add received appointments to calendar'
						)}
						onClick={(): void =>
							updateSettings({
								target: {
									name: 'zimbraPrefCalendarAutoAddInvites',
									value: settingsObj.zimbraPrefCalendarAutoAddInvites === 'TRUE' ? 'FALSE' : 'TRUE'
								}
							})
						}
					/>
					<Checkbox
						value={settingsObj.zimbraPrefCalendarShowDeclinedMeetings === 'TRUE'}
						onClick={(): void =>
							updateSettings({
								target: {
									name: 'zimbraPrefCalendarShowDeclinedMeetings',
									value:
										settingsObj.zimbraPrefCalendarShowDeclinedMeetings === 'TRUE' ? 'FALSE' : 'TRUE'
								}
							})
						}
						label={t('label.show_declined_meetings', 'Show declined meetings')}
					/>
				</Container>
			</FormSubSection>
			<FormSubSection label={t('settings.label.invitation_response', 'Invitation Response')}>
				<Checkbox
					value={settingsObj.zimbraPrefDeleteInviteOnReply === 'TRUE'}
					onClick={(): void =>
						updateSettings({
							target: {
								name: 'zimbraPrefDeleteInviteOnReply',
								value: settingsObj.zimbraPrefDeleteInviteOnReply === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
					label={t('settings.label.delete_invt_on_rply', 'Delete invite on reply')}
				/>
			</FormSubSection>
			<FormSubSection label={t('settings.label.forward_invites', 'Forward Invites')}>
				<Input
					hasError={isEmailNotValid}
					label={t('settings.label.enter_email', 'Enter e-mail address')}
					onChange={(e): void => {
						if (isEmailNotValid) setIsEmailNotValid(false);
						updateSettings({
							target: {
								name: 'zimbraPrefCalendarForwardInvitesTo',
								value: e.target.value
							}
						});
					}}
					value={settingsObj.zimbraPrefCalendarForwardInvitesTo || ''}
				/>
				{isEmailNotValid && (
					<Text size="small" color="error">
						{t('settings.invalid_email', 'Not a valid e-mail')}
					</Text>
				)}
			</FormSubSection>
			<FormSubSection label={t('settings.label.show_reminders', 'Show Reminders')}>
				<Container gap={'1rem'}>
					<Select
						label={t('settings.label.span_time', 'Span time')}
						items={showReminderOptions}
						onChange={(time): void => {
							if (time) {
								updateSettings({
									target: { name: 'zimbraPrefCalendarApptReminderWarningTime', value: time }
								});
							}
						}}
						defaultSelection={showReminderSelection}
					/>
					<Container gap={'0.5rem'} mainAlignment={'flex-start'} crossAlignment={'flex-start'}>
						<Checkbox
							value={settingsObj.zimbraPrefCalendarShowPastDueReminders === 'TRUE'}
							onClick={(): void =>
								updateSettings({
									target: {
										name: 'zimbraPrefCalendarShowPastDueReminders',
										value:
											settingsObj.zimbraPrefCalendarShowPastDueReminders === 'TRUE'
												? 'FALSE'
												: 'TRUE'
									}
								})
							}
							label={t(
								'settings.label.show_rmndr_past_due_meetings',
								'Show reminders for past-due meetings'
							)}
						/>
						<Checkbox
							value={settingsObj.zimbraPrefCalendarReminderSoundsEnabled === 'TRUE'}
							onClick={(): void =>
								updateSettings({
									target: {
										name: 'zimbraPrefCalendarReminderSoundsEnabled',
										value:
											settingsObj.zimbraPrefCalendarReminderSoundsEnabled === 'TRUE'
												? 'FALSE'
												: 'TRUE'
									}
								})
							}
							label={t(
								'settings.label.enable_reminder_sound',
								'Play a sound (requires QuickTime or Windows Media plugin)'
							)}
						/>
						<Checkbox
							label={t('settings.label.show_popup_notification', 'Show a popup notification')}
							value={settingsObj.zimbraPrefCalendarToasterEnabled === 'TRUE'}
							onClick={(): void =>
								updateSettings({
									target: {
										name: 'zimbraPrefCalendarToasterEnabled',
										value:
											settingsObj.zimbraPrefCalendarToasterEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
									}
								})
							}
						/>
					</Container>
				</Container>
			</FormSubSection>
			<FormSubSection label={t('settings.label.default_appt_dur', 'Default appointment duration')}>
				<Select
					label={t('settings.label.span_time', 'Span time')}
					items={spanTimeOptions}
					onChange={(dur): void => {
						if (dur) {
							updateSettings({
								target: { name: 'zimbraPrefCalendarDefaultApptDuration', value: dur }
							});
						}
					}}
					defaultSelection={spanTimeSelection}
				/>
			</FormSubSection>
		</FormSection>
	);
}
