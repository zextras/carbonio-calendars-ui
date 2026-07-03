/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Divider,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Padding,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { FOLDERS, Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { PREFS_DEFAULTS } from 'constants/index';
import { importAppointmentsRequest } from 'soap/import-appointments-request';
import { NoOpRequest } from 'soap/noop-request';
import { StoreProvider } from 'store/redux';
import { CalendarSelector } from 'view/editor/parts/calendar-selector';

export type ImportAppointmentsModalProps = {
	messageId: string;
	part: string;
	fileName?: string;
	onClose: () => void;
};

export const ImportAppointmentsModal = ({
	messageId,
	part,
	fileName,
	onClose
}: ImportAppointmentsModalProps): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { zimbraPrefDefaultCalendarId } = useUserSettings().prefs;
	const [selectedCalendar, setSelectedCalendar] = useState<Folder | undefined>();

	const calendarId = useMemo(
		() =>
			selectedCalendar?.id ??
			(zimbraPrefDefaultCalendarId as string) ??
			PREFS_DEFAULTS.DEFAULT_CALENDAR_ID ??
			FOLDERS.CALENDAR,
		[selectedCalendar?.id, zimbraPrefDefaultCalendarId]
	);

	const onConfirm = useCallback(() => {
		onClose();
		createSnackbar({
			key: 'import ongoing',
			replace: true,
			severity: 'info',
			label: t('label.import_calendar_ongoing', 'Import into the selected calendar in progress.'),
			hideButton: true
		});
		importAppointmentsRequest({ folderId: calendarId, mid: messageId, part })
			.then(() => NoOpRequest())
			.then(() => {
				createSnackbar({
					key: 'import success',
					replace: true,
					severity: 'success',
					label: t('label.import_calendar_success', 'Import successful'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			})
			.catch(() => {
				createSnackbar({
					key: 'import failed',
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			});
	}, [onClose, createSnackbar, t, calendarId, messageId, part]);

	return (
		<>
			<ModalHeader
				title={t('import_to_calendar', 'Import to Calendars')}
				showCloseIcon
				onClose={onClose}
			/>
			<Divider />
			<ModalBody>
				<Text overflow="break-word">
					{t('message.import_appointment_from_email', {
						fileName,
						defaultValue:
							'The appointments contained in "{{fileName}}" will be imported into the selected calendar.'
					})}
				</Text>
				<Padding top="medium" />
				<Text overflow="break-word">
					{t('label.select_destination_calendar', 'Select the destination calendar:')}
				</Text>
				<Padding top="small" />
				<CalendarSelector
					calendarId={calendarId}
					onCalendarChange={setSelectedCalendar}
					excludeTrash
					label={t('label.destination_calendar', 'Destination calendar')}
				/>
			</ModalBody>
			<Divider />
			<ModalFooter onConfirm={onConfirm} onClose={onClose} confirmLabel={t('import', 'Import')} />
		</>
	);
};

/**
 * Self-contained wrapper exposed to other modules (e.g. Mails) through the Shell
 * component registry. It is rendered inside the consumer module's own modal
 * manager, so it must bring its own providers.
 */
export const ImportAppointmentsModalComp = (props: ImportAppointmentsModalProps): ReactElement => (
	<StoreProvider>
		<ImportAppointmentsModal {...props} />
	</StoreProvider>
);
