/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import {
	Container,
	Padding,
	Text,
	SelectItem,
	useSnackbar,
	AnyColor
} from '@zextras/carbonio-design-system';
import { FOLDERS, useFoldersMapByRoot, useRoot, hasId } from '@zextras/carbonio-ui-commons';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { CALENDARS_STANDARD_COLORS } from '../../constants/calendar';
import { createCalendar } from '../../store/actions/create-calendar';
import { EventType } from '../../types/event';
import { CalendarNameInput } from '../forms/calendar-name-input';
import { URLInput } from '../forms/calendar-url-input';
import { FreeBusyCheckbox } from '../forms/free-busy-checkbox';
import { SelectColor } from '../forms/select-color';

const Square = styled.div<{ $color?: AnyColor }>`
	width: 1.125rem;
	height: 1.125rem;
	position: relative;
	top: -0.1875rem;
	border: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	background: ${({ $color }): string | undefined => $color};
	border-radius: 0.25rem;
`;

const TextUpperCase = styled(Text)`
	text-transform: capitalize;
`;

const getStatusItems = (): SelectItem[] =>
	CALENDARS_STANDARD_COLORS.map((el, index) => ({
		background: el.background,
		label: el.label ?? '',
		value: index.toString(),
		customComponent: (
			<Container width="100%" mainAlignment="space-between" orientation="horizontal" height="fit">
				<Padding left="small">
					<TextUpperCase>{el.label}</TextUpperCase>
				</Padding>
				<Padding right="small">
					<Square $color={el.color} />
				</Padding>
			</Container>
		)
	}));

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
	fromUrl?: boolean;
};

export const NewCalendarModal = ({
	onClose,
	toggleModal,
	event,
	fromUrl,
	action,
	folderId
}: NewModalProps): ReactElement => {
	const [t] = useTranslation();
	const [inputValue, setInputValue] = useState('');
	const [urlValue, setUrlValue] = useState('');
	const [freeBusy, setFreeBusy] = useState(false);
	const toggleFreeBusy = useCallback(() => setFreeBusy((c) => !c), []);
	const colors = useMemo(() => getStatusItems(), []);
	const [selectedColor, setSelectedColor] = useState(0);
	const createSnackbar = useSnackbar();
	const root = useRoot(folderId);

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
				url: urlValue,
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
			{fromUrl && (
				<>
					<URLInput value={urlValue} onChange={setUrlValue} />
					<Padding vertical="medium" />
				</>
			)}
			<CalendarNameInput value={inputValue} onChange={setInputValue} />
			{showDupWarning && (
				<Padding all="small">
					<Text size="small" color="error">
						{t('folder.modal.new.duplicate_warning', 'Calendar with the same name already exists')}
					</Text>
				</Padding>
			)}
			<Padding vertical="medium" />
			<SelectColor colors={colors} setColor={setSelectedColor} />
			<Padding vertical="medium" />
			<FreeBusyCheckbox value={freeBusy} onClick={toggleFreeBusy} />
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
