/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Container, Padding, useSnackbar } from '@zextras/carbonio-design-system';
import { useFoldersMapByRoot, useRoot } from '@zextras/carbonio-ui-commons';
import { BaseFolder } from '@zextras/carbonio-ui-soap-lib';
import { includes, isEmpty, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CalendarNameInput } from '../../forms/calendar-name-input';
import { CALENDAR_NAME_ALREADY_EXISTS, CalendarNameErrors } from '../../forms/error-codes';
import { FreeBusyCheckbox } from '../../forms/free-busy-checkbox';
import { SelectColor } from '../../forms/select-color';
import { createCalendar } from '../../store/actions/create-calendar';

type CreateCalendarModalProps = {
	toggleModal?: () => void;
	confirmLabel: string;
	onClose: () => void;
	onCreated?: (response: BaseFolder) => void;
	folderId: string;
};

export const CreateCalendarModal = ({
	onClose,
	onCreated,
	toggleModal,
	confirmLabel,
	folderId
}: CreateCalendarModalProps): ReactElement => {
	const [t] = useTranslation();
	const [calendarName, setCalendarName] = useState('');
	const [freeBusy, setFreeBusy] = useState(false);
	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);
	const [selectedColor, setSelectedColor] = useState(0);
	const createSnackbar = useSnackbar();
	const root = useRoot(folderId);
	const title = t('folder.modal.new.title2', 'New calendar creation');

	const folders = useFoldersMapByRoot(root?.id ?? '1');
	const folderArray = useMemo(() => map(folders, (f) => f.name), [folders]);
	const calendarNameErrors = useMemo((): CalendarNameErrors | undefined => {
		const alreadyExists = includes(folderArray, calendarName);
		if (alreadyExists) {
			return { [CALENDAR_NAME_ALREADY_EXISTS]: '' };
		}
		return undefined;
	}, [calendarName, folderArray]);
	const resetInputs = useCallback(() => {
		setCalendarName('');
		setSelectedColor(0);
		setFreeBusy(false);
	}, []);
	const disabled = useMemo(
		() =>
			calendarName.indexOf('/') > -1 ||
			calendarName.length === 0 ||
			calendarName === 'Calendar' ||
			calendarName === 'calendar' ||
			!isEmpty(calendarNameErrors),
		[calendarName, calendarNameErrors]
	);

	const onCloseModal = useCallback(() => {
		resetInputs();
		onClose();
	}, [onClose, resetInputs]);

	const onConfirm = (): void => {
		if (!calendarName) return;
		createCalendar({
			parent: (root?.id as '1') ?? '1',
			name: calendarName,
			color: selectedColor,
			excludeFreeBusy: freeBusy
		}).then((response) => {
			if (!('errors' in response)) {
				onCreated?.(response);
				createSnackbar({
					key: `new`,
					replace: true,
					severity: 'success',
					label: t('message.snackbar.new_calendar_created', 'New calendar created'),
					autoHideTimeout: 3000,
					hideButton: true
				});
				onCloseModal();
			} else {
				if (response.errors.url) {
					return;
				}
				createSnackbar({
					key: `error`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
	};

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onCloseModal} />
			<CalendarNameInput
				value={calendarName}
				onChange={setCalendarName}
				errors={calendarNameErrors}
			/>
			<Padding vertical="medium" />
			<SelectColor onColorSelected={setSelectedColor} />
			<Padding vertical="medium" />
			<FreeBusyCheckbox value={freeBusy} onClick={toggleFreeBusy} />
			<ModalFooter
				onConfirm={onConfirm}
				secondaryAction={toggleModal}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
				label={confirmLabel}
				disabled={disabled}
			/>
		</Container>
	);
};
