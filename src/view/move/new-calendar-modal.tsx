/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	Container,
	Input,
	Padding,
	Select,
	Text,
	Checkbox,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { FOLDERS, useFoldersMapByRoot, useRoot, hasId } from '@zextras/carbonio-ui-commons';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { buildCalendarColorItems, CalendarColorLabelFactory } from 'commons/calendar-color-picker';
import { ModalHeader } from 'commons/modal-header';
import { createCalendar } from 'store/actions/create-calendar';
import { EventType } from 'types/event';

type ActionArgs = {
	inviteId: string;
	l: string;
	id: string;
	destinationCalendarName: string;
};

type NewModalProps = {
	toggleModal?: () => void;
	onClose: () => void;
	event?: EventType;
	folderId: string;
	action?: (arg: ActionArgs) => void;
};

export const NewModal = ({
	onClose,
	toggleModal,
	event,
	action,
	folderId
}: NewModalProps): ReactElement => {
	const [t] = useTranslation();
	const [inputValue, setInputValue] = useState('');
	const [freeBusy, setFreeBusy] = useState(false);
	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);
	const colors = useMemo(() => buildCalendarColorItems(), []);
	const [selectedColor, setSelectedColor] = useState(0);
	const createSnackbar = useSnackbar();
	const root = useRoot(folderId);
	const nameInputRef = useRef<HTMLInputElement>(null);

	const folders = useFoldersMapByRoot(root?.id ?? '1');
	const folderArray = useMemo(() => map(folders, (f) => f.name), [folders]);
	const showDupWarning = useMemo(
		() => includes(folderArray, inputValue),
		[inputValue, folderArray]
	);
	const disabled = useMemo(
		() =>
			inputValue.indexOf('/') > -1 ||
			inputValue.length === 0 ||
			inputValue === 'Calendar' ||
			inputValue === 'calendar' ||
			showDupWarning,
		[inputValue, showDupWarning]
	);

	const onConfirm = (): void => {
		if (inputValue) {
			createCalendar({
				parent: (root?.id as '1') ?? '1',
				name: inputValue,
				color: selectedColor,
				excludeFreeBusy: freeBusy
			}).then((newCalendarRes) => {
				if (!newCalendarRes.Fault) {
					action &&
						event &&
						action({
							inviteId: event.resource.inviteId,
							l: newCalendarRes.id,
							destinationCalendarName: newCalendarRes.name,
							id: event.resource.id
						});
					createSnackbar({
						key: `new`,
						replace: true,
						severity: 'success',
						label: t('message.snackbar.new_calendar_created', 'New calendar created'),
						autoHideTimeout: 3000,
						hideButton: true
					});
					onClose();
				} else {
					createSnackbar({
						key: `move`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
					onClose();
				}
			});
		}
		setInputValue('');
		setSelectedColor(0);
		setFreeBusy(false);
		onClose();
	};

	const onCloseModal = useCallback(() => {
		setInputValue('');
		setSelectedColor(0);
		setFreeBusy(false);
		onClose();
	}, [onClose]);

	const placeholder = useMemo(() => `${t('label.type_name_here', 'Calendar name')}*`, [t]);

	useEffect(() => {
		nameInputRef.current?.focus();
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('folder.modal.new.title2', 'New calendar creation')}
				onClose={onCloseModal}
			/>
			<Input
				label={placeholder}
				backgroundColor="gray5"
				value={inputValue}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					setInputValue(e.target.value);
				}}
				inputRef={nameInputRef}
			/>
			{showDupWarning && (
				<Padding all="small">
					<Text size="small" color="error">
						{t('folder.modal.new.duplicate_warning', 'Calendar with the same name already exists')}
					</Text>
				</Padding>
			)}
			<Padding vertical="medium" />
			<Select
				label={'Select color'}
				onChange={(value): void => {
					if (value) {
						setSelectedColor(parseInt(value, 10));
					}
				}}
				items={colors}
				defaultSelection={colors[0]}
				LabelFactory={CalendarColorLabelFactory}
			/>
			<Padding vertical="medium" />
			<Checkbox
				value={freeBusy}
				onClick={toggleFreeBusy}
				label={t(
					'label.exclude_free_busy',
					'Exclude this calendar when reporting the free/busy times'
				)}
			/>
			<ModalFooter
				onConfirm={onConfirm}
				secondaryAction={toggleModal}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
				label={
					event && hasId(event.resource.calendar, FOLDERS.TRASH)
						? t('folder.modal.restore.footer', 'Create and Restore')
						: t('label.create', 'Create')
				}
				disabled={disabled}
			/>
		</Container>
	);
};
