/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useRef, useCallback, useMemo } from 'react';

import styled from '@emotion/styled';
import {
	AccordionItemProps,
	useSnackbar,
	useModal,
	AccordionItemType,
	ModalHeader,
	Divider,
	ModalBody,
	ModalFooter,
	Row,
	Padding,
	Tooltip,
	AccordionItem,
	Dropdown,
	Icon,
	Text
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import {
	FOLDERS,
	useFolder,
	Folder,
	ROOT_NAME,
	getRootAccountId,
	useRoot,
	getFolderIdParts
} from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { importCalendarICSFn } from 'actions/calendar-actions-fn';
import {
	recursiveToggleCheck,
	getFolderIcon,
	isExternalSyncFolder,
	isLinkChild
} from 'commons/utilities';
import { useCalendarActions } from 'hooks/use-calendar-actions';
import { useCheckedCalendarsQuery } from 'hooks/use-checked-calendars-query';
import { setCalendarColor } from 'normalizations/normalizations-utils';
import { NoOpRequest } from 'soap/noop-request';
import { useAppDispatch } from 'store/redux/hooks';
import { useRangeStart, useRangeEnd } from 'store/zustand/hooks';

const CalendarContextMenuItem = ({
	children,
	inputRef,
	item
}: {
	children: React.JSX.Element;
	inputRef: React.RefObject<HTMLInputElement>;
	item: Folder;
}): React.JSX.Element => {
	const items = useCalendarActions(item, inputRef);

	return (
		<Dropdown items={items} contextMenu width="100%" display="block">
			{children}
		</Dropdown>
	);
};

const RowWithIcon = (
	icon: string,
	color: string,
	tooltipText: string,
	testId?: string
): React.JSX.Element => (
	<Padding left="small" data-testid={testId}>
		<Tooltip placement="right" label={tooltipText}>
			<Row>
				<Icon icon={icon} color={color} size="medium" />
			</Row>
		</Tooltip>
	</Padding>
);

const FileInput = styled.input`
	display: none;
`;

export const CalendarAccordionItem: FC<AccordionItemProps> = (props) => {
	const calendarId = props.item.id;
	const calendar = useFolder(calendarId);

	const { displayName } = useUserAccount();
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();
	const inputRef = useRef<HTMLInputElement>(null);
	const createSnackbar = useSnackbar();
	const { createModal, closeModal } = useModal();

	const user = useUserAccount();
	const rootAccountId = calendar?.id && getRootAccountId(calendar.id);
	const root = useRoot(rootAccountId ?? FOLDERS.USER_ROOT);

	const onClick = useCallback((): void => {
		if (!calendar) {
			return;
		}

		recursiveToggleCheck({
			folder: calendar,
			checked: calendar.checked ?? false,
			dispatch,
			start,
			end,
			query
		});
	}, [dispatch, end, calendar, query, start]);

	const folderName = useMemo((): string => {
		const { id } = getFolderIdParts(calendarId);
		if (id === FOLDERS.CALENDAR) {
			return t('label.calendar', 'Calendar');
		}

		if (id === FOLDERS.TRASH) {
			return t('label.trash', 'Trash');
		}

		return calendar?.name ?? '';
	}, [calendar?.name, calendarId, t]);

	const accordionItem = useMemo<AccordionItemType | null>(() => {
		if (!calendar) {
			return null;
		}
		return {
			...calendar,
			label: folderName,
			icon: getFolderIcon({ item: calendar, checked: calendar.checked ?? false }),
			iconColor: setCalendarColor({ color: calendar.color, rgb: calendar.rgb }).color
		} as AccordionItemType;
	}, [calendar, folderName]);

	const sharedStatusIcon = useMemo<React.ReactNode>(() => {
		if (!calendar) {
			return null;
		}

		if (calendar.isLink || isLinkChild(calendar)) {
			const tooltipText = t('tooltip.folder_linked_status', 'Linked to me');
			return RowWithIcon('Linked', 'linked', tooltipText);
		}

		if (calendar.acl?.grant) {
			const tooltipText = t('tooltip.folder_sharing_status', {
				count: calendar.acl.grant.length,
				defaultValue_one: 'Shared with {{count}} person',
				defaultValue: 'Shared with {{count}} people'
			});
			return RowWithIcon('Shared', 'shared', tooltipText);
		}
		return null;
	}, [calendar, t]);

	const externalStatusIcon = useMemo<React.ReactNode>(() => {
		if (!calendar || !isExternalSyncFolder(calendar)) {
			return null;
		}

		const tooltipText = t('tooltip.folder_external_status', 'ICS calendar added from URL');
		return RowWithIcon('Link2', 'gray0', tooltipText, 'external-calendar-indicator');
	}, [calendar, t]);

	const userMail = useMemo(
		() => (root?.name === ROOT_NAME ? user.name : (root?.name ?? user.name)),
		[root, user.name]
	);

	const confirmModal = useCallback(() => {
		if (!calendar) {
			return;
		}

		if (inputRef?.current?.files) {
			createSnackbar({
				key: `import ongoing`,
				replace: true,
				severity: 'info',
				label: t('label.import_calendar_ongoing', 'Import into the selected calendar in progress.'),
				hideButton: true
			});
			importCalendarICSFn(inputRef?.current?.files, userMail, calendar.name).then((res) => {
				if (res[0].status === 200) {
					NoOpRequest().then(() => {
						createSnackbar({
							key: `import success`,
							replace: true,
							severity: 'success',
							label: t('label.import_calendar_success', 'Import successful'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					});
				} else {
					createSnackbar({
						key: `import failed`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		}
	}, [calendar, createSnackbar, t, userMail]);

	const onFileInputChange = useCallback(() => {
		if (!calendar) {
			return;
		}

		if (inputRef?.current?.files) {
			const modalId = 'import-appointments';
			createModal(
				{
					id: modalId,
					size: 'small',
					children: (
						<>
							<ModalHeader
								title={t('import_appointments', 'Import appointments')}
								showCloseIcon
								onClose={(): void => {
									closeModal(modalId);
								}}
							/>
							<Divider />
							<ModalBody>
								<Text overflow="break-word">
									{t('message.import_appointment_modal', {
										fileName: inputRef?.current?.files[0].name,
										calendarName: calendar.name,
										defaultValue:
											'The appointments contained within {{fileName}} will be imported into the "{{calendarName}}" calendar.'
									})}
								</Text>
							</ModalBody>
							<Divider />
							<ModalFooter
								onConfirm={(): void => {
									closeModal(modalId);
									confirmModal();
								}}
								onClose={(): void => {
									closeModal(modalId);
								}}
								confirmLabel={t('import', 'Import')}
							/>
						</>
					),
					onClose: () => {
						closeModal(modalId);
					}
				},
				true
			);
		}
	}, [calendar, createModal, t, closeModal, confirmModal]);

	if (!calendar || !accordionItem) {
		return null;
	}

	return (
		<>
			<CalendarContextMenuItem item={calendar} inputRef={inputRef}>
				<Row onClick={onClick}>
					<Padding left="small" />
					<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
						<AccordionItem item={accordionItem} />
					</Tooltip>
					{externalStatusIcon}
					{sharedStatusIcon}
				</Row>
			</CalendarContextMenuItem>
			<FileInput
				data-testid="icsFileInput"
				type="file"
				ref={inputRef}
				onChange={onFileInputChange}
				accept=".ics"
			/>
		</>
	);
};
