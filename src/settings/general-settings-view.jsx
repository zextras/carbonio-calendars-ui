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
	FormSection
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import {
	ShowReminderOptions,
	DefaultViewOptions,
	StartWeekOfOptions,
	DefaultApptVisibiltyOptions,
	SpanTimeOptions,
	findLabel
} from './components/utils';
import { generalSubSection } from './sub-sections';

export default function GeneralSettings({
	settingsObj,
	updateSettings,
	isEmailNotValid,
	setisEmailNotValid
}) {
	const sectionTitleGeneral = useMemo(() => generalSubSection(), []);
	const showReminderOptions = useMemo(() => ShowReminderOptions(), []);
	const defaultViewOptions = useMemo(() => DefaultViewOptions(), []);
	const startWeekOfOptions = useMemo(() => StartWeekOfOptions(), []);
	const spanTimeOptions = useMemo(
		() => SpanTimeOptions(settingsObj.zimbraPrefCalendarDefaultApptDuration.includes('m')),
		[settingsObj.zimbraPrefCalendarDefaultApptDuration]
	);
	const defaultApptVisibiltyOptions = useMemo(() => DefaultApptVisibiltyOptions(), []);

	return (
		<FormSection id={sectionTitleGeneral.id} label={sectionTitleGeneral.label}>
			<FormSubSection>
				<Select
					label={t('label.default_view', 'Default view')}
					items={defaultViewOptions}
					onChange={(view) =>
						updateSettings({ target: { name: 'zimbraPrefCalendarInitialView', value: view } })
					}
					defaultSelection={{
						label: findLabel(defaultViewOptions, settingsObj.zimbraPrefCalendarInitialView),
						value: settingsObj.zimbraPrefCalendarInitialView
					}}
				/>
				<Select
					label={t('label.start_week_on', 'Start week on')}
					items={startWeekOfOptions}
					onChange={(day) =>
						updateSettings({
							target: { name: 'zimbraPrefCalendarFirstDayOfWeek', value: day }
						})
					}
					defaultSelection={{
						label: findLabel(startWeekOfOptions, settingsObj.zimbraPrefCalendarFirstDayOfWeek),
						value: settingsObj.zimbraPrefCalendarFirstDayOfWeek
					}}
				/>
				<Select
					label={t('label.default_appt_vsblty', 'Default appointment visibility')}
					items={defaultApptVisibiltyOptions}
					onChange={(mode) =>
						updateSettings({
							target: { name: 'zimbraPrefCalendarApptVisibility', value: mode }
						})
					}
					defaultSelection={{
						label: findLabel(
							defaultApptVisibiltyOptions,
							settingsObj.zimbraPrefCalendarApptVisibility
						),
						value: settingsObj.zimbraPrefCalendarApptVisibility
					}}
				/>
				<Checkbox
					value={settingsObj.zimbraPrefCalendarAutoAddInvites === 'TRUE'}
					label={t(
						'label.auto_add_rcvd_app',
						'Automatically add received appointments to calendar'
					)}
					onClick={() =>
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
					onClick={() =>
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
			</FormSubSection>
			<FormSubSection label={t('settings.label.invitation_response', 'Invitation Response')}>
				<Checkbox
					value={settingsObj.zimbraPrefDeleteInviteOnReply === 'TRUE'}
					onClick={() =>
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
					onChange={(e) => {
						if (isEmailNotValid) setisEmailNotValid(false);
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
				<Select
					label={t('settings.label.span_time', 'Span time')}
					items={showReminderOptions}
					onChange={(time) =>
						updateSettings({
							target: { name: 'zimbraPrefCalendarApptReminderWarningTime', value: time }
						})
					}
					defaultSelection={{
						label: findLabel(
							showReminderOptions,
							settingsObj.zimbraPrefCalendarApptReminderWarningTime
						),
						value: settingsObj.zimbraPrefCalendarApptReminderWarningTime
					}}
				/>
				<Checkbox
					value={settingsObj.zimbraPrefCalendarShowPastDueReminders === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefCalendarShowPastDueReminders',
								value:
									settingsObj.zimbraPrefCalendarShowPastDueReminders === 'TRUE' ? 'FALSE' : 'TRUE'
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
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefCalendarReminderSoundsEnabled',
								value:
									settingsObj.zimbraPrefCalendarReminderSoundsEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
					label={t(
						'settings.label.enable_reminder_sound',
						'Play a sound (requires QuickTime or Windows Media plugin)'
					)}
				/>
				<Checkbox
					value={settingsObj.zimbraPrefMailFlashTitle === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefMailFlashTitle',
								value: settingsObj.zimbraPrefMailFlashTitle === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
					label={t('settings.label.flash_browser_title', 'Flash the browser title')}
				/>
				<Checkbox
					label={t('settings.label.show_popup_notification', 'Show a popup notification')}
					value={settingsObj.zimbraPrefCalendarToasterEnabled === 'TRUE'}
					onClick={() =>
						updateSettings({
							target: {
								name: 'zimbraPrefCalendarToasterEnabled',
								value: settingsObj.zimbraPrefCalendarToasterEnabled === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
			</FormSubSection>
			<FormSubSection label={t('settings.label.default_appt_dur', 'Default appointment duration')}>
				<Select
					label={t('settings.label.span_time', 'Span time')}
					items={spanTimeOptions}
					onChange={(dur) =>
						updateSettings({
							target: { name: 'zimbraPrefCalendarDefaultApptDuration', value: dur }
						})
					}
					defaultSelection={{
						label: findLabel(spanTimeOptions, settingsObj.zimbraPrefCalendarDefaultApptDuration),
						value: settingsObj.zimbraPrefCalendarDefaultApptDuration
					}}
				/>
			</FormSubSection>
		</FormSection>
	);
}
