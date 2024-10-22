/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useRef } from 'react';

import {
	AccordionItem,
	AccordionItemType,
	Avatar,
	Dropdown,
	Icon,
	Padding,
	Row,
	Tooltip,
	useModal,
	useSnackbar,
	ModalHeader,
	ModalFooter,
	ModalBody,
	Divider,
	Text,
	DropdownItem
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { every, find, forEach, map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { importCalendarICSFn } from '../../../actions/calendar-actions-fn';
import { ROOT_NAME } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import {
	getRootAccountId,
	getUpdateFolder,
	useFolder,
	useFoldersMap,
	useRoot
} from '../../../carbonio-ui-commons/store/zustand/folder';
import { CalendarGroup, Folder, type LinkFolder } from '../../../carbonio-ui-commons/types';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import {
	getFolderIcon,
	getFolderTranslatedName,
	isLinkChild,
	recursiveToggleCheck
} from '../../../commons/utilities';
import { FOLDER_OPERATIONS } from '../../../constants/api';
import { CALENDARS_STANDARD_COLORS } from '../../../constants/calendar';
import { SIDEBAR_ITEMS, SIDEBAR_ROOT_SUBSECTION } from '../../../constants/sidebar';
import { useCalendarActions } from '../../../hooks/use-calendar-actions';
import { useCheckedCalendarsQuery } from '../../../hooks/use-checked-calendars-query';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { NoOpRequest } from '../../../soap/noop-request';
import { folderAction } from '../../../store/actions/calendar-actions';
import { getMiniCal } from '../../../store/actions/get-mini-cal';
import { searchAppointments } from '../../../store/actions/search-appointments';
import { useAppDispatch } from '../../../store/redux/hooks';
import { useRangeEnd, useRangeStart } from '../../../store/zustand/hooks';

type FoldersComponentProps = {
	item: AccordionItemType;
};

const FittedRow = styled(Row)`
	max-width: calc(100% - (2 * ${({ theme }): string => theme.sizes.padding.small}));
	height: 3rem;
`;

const FileInput = styled.input`
	display: none;
`;

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

const GroupContextMenuItem = ({
	children,
	item
}: {
	children: React.JSX.Element;
	item: CalendarGroup;
}): React.JSX.Element => {
	const isAllCalendar = useMemo(() => hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR), [item]);
	// TODO: implement actions for groups
	const items: DropdownItem[] = [];

	return isAllCalendar ? (
		children
	) : (
		<Dropdown items={items} contextMenu width="100%" display="block">
			{children}
		</Dropdown>
	);
};

const isGroupType = (item: AccordionItemType): item is CalendarGroup => 'calendarId' in item;

const isCalendarType = (item: AccordionItemType): item is Folder => !isGroupType(item);

const RowWithIcon = (icon: string, color: string, tooltipText: string): React.JSX.Element => (
	<Padding left="small">
		<Tooltip placement="right" label={tooltipText}>
			<Row>
				<Icon icon={icon} color={color} size="medium" />
			</Row>
		</Tooltip>
	</Padding>
);

const RootSubsection = ({ item }: { item: AccordionItemType }): React.JSX.Element => {
	const accordionItem = useMemo(
		() =>
			({
				...item,
				label: item.label,
				textProps: { size: 'small' }
			}) as AccordionItemType,
		[item]
	);
	return (
		<Row>
			<Padding left="small" />
			<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
				<AccordionItem item={accordionItem} />
			</Tooltip>
		</Row>
	);
};

const RootGroupChildren = ({ item }: { item: CalendarGroup }): React.JSX.Element => {
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();
	const calendars = useFoldersMap();

	const calendarsInGroup = useMemo(
		() =>
			reduce(
				item.calendarId,
				(acc, calendarId) => {
					const calendarToAdd = find(calendars, (cal) => cal.id === calendarId);
					if (calendarToAdd) {
						return [...acc, calendarToAdd];
					}
					return acc;
				},
				[] as Array<Folder>
			),
		[calendars, item]
	);

	const checked = every(calendarsInGroup, (cal) => cal.checked);

	const onClick = useCallback((): void => {
		const op = checked ? FOLDER_OPERATIONS.UNCHECK : FOLDER_OPERATIONS.CHECK;
		const actions = map(item.calendarId, (id) => ({
			id,
			op
		}));
		folderAction(actions).then((res) => {
			if (op === FOLDER_OPERATIONS.CHECK && !res.Fault) {
				dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
				dispatch(getMiniCal({ start, end })).then((response) => {
					const updateFolder = getUpdateFolder();
					// todo: remove ts ignore once getMiniCal is typed
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					if (response?.payload?.Fault) {
						// todo: remove ts ignore once getMiniCal is typed
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						forEach(response?.payload?.Fault, ({ id }) => {
							updateFolder(id, { broken: true });
						});
					}
				});
			}
		});
	}, [checked, dispatch, end, item.calendarId, query, start]);

	const accordionItem = useMemo(
		() =>
			({
				...item,
				label: item.name,
				icon: checked ? 'Calendar2' : 'CalendarOutline',
				iconColor: CALENDARS_STANDARD_COLORS[0].color,
				textProps: { size: 'small' }
			}) as AccordionItemType,
		[checked, item]
	);

	return (
		<GroupContextMenuItem item={item}>
			<Row onClick={onClick}>
				<Padding left="small" />
				<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
					<AccordionItem item={accordionItem} />
				</Tooltip>
			</Row>
		</GroupContextMenuItem>
	);
};

const RootCalendarChildren = ({ item }: { item: AccordionItemType }): React.JSX.Element => {
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
	const rootAccountId = getRootAccountId(item.id);
	const root = useRoot(rootAccountId ?? FOLDERS.USER_ROOT);

	const calendar = useFolder(item.id);
	const onClick = useCallback(
		(): void =>
			recursiveToggleCheck({
				folder: calendar,
				checked: calendar?.checked ?? false,
				dispatch,
				start,
				end,
				query
			}),
		[dispatch, end, calendar, query, start]
	);

	const accordionItem = useMemo(
		() =>
			({
				...calendar,
				label:
					calendar?.id === FOLDERS.USER_ROOT
						? displayName
						: (getFolderTranslatedName({
								folderId: calendar?.id,
								folderName: calendar?.name ?? ''
							}) ?? ''),
				icon: getFolderIcon({ item: calendar, checked: calendar?.checked ?? false }),
				iconColor: setCalendarColor({ color: calendar?.color, rgb: calendar?.rgb }).color,
				textProps: { size: 'small' }
			}) as AccordionItemType,
		[calendar, displayName]
	);

	const sharedStatusIcon = useMemo(() => {
		if (calendar?.isLink || isLinkChild(calendar)) {
			const tooltipText = t('tooltip.folder_linked_status', 'Linked to me');
			return RowWithIcon('Linked', 'linked', tooltipText);
		}
		if (calendar?.acl?.grant) {
			const tooltipText = t('tooltip.calendar_sharing_status', {
				count: calendar?.acl?.grant?.length,
				defaultValue_one: 'Shared with 1 person',
				defaultValue: 'Shared with {{count}} people'
			});
			return RowWithIcon('Shared', 'shared', tooltipText);
		}
		return '';
	}, [calendar, t]);

	const userMail = useMemo(
		() => (root?.name === ROOT_NAME ? user.name : (root?.name ?? user.name)),
		[root, user.name]
	);

	const confirmModal = useCallback(() => {
		if (inputRef?.current?.files) {
			createSnackbar({
				key: `import ongoing`,
				replace: true,
				severity: 'info',
				label: t('label.import_calendar_ongoing', 'Import into the selected calendar in progress.'),
				hideButton: true
			});
			importCalendarICSFn(inputRef?.current?.files, userMail, calendar?.name ?? '').then((res) => {
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
	}, [createSnackbar, calendar?.name, t, userMail]);

	const onFileInputChange = useCallback(() => {
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
										calendarName: calendar?.name ?? '',
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
	}, [closeModal, confirmModal, createModal, calendar?.name, t]);

	return (
		<>
			<CalendarContextMenuItem item={calendar} inputRef={inputRef}>
				<Row onClick={onClick}>
					<Padding left="small" />
					<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
						<AccordionItem item={accordionItem} />
					</Tooltip>
					{sharedStatusIcon}
				</Row>
			</CalendarContextMenuItem>
			<FileInput type="file" ref={inputRef} onChange={onFileInputChange} accept=".ics" />
		</>
	);
};

const RootAccount = ({ item }: { item: Folder }): React.JSX.Element => {
	const { displayName } = useUserAccount();
	const accordionItem = useMemo(
		() =>
			({
				...item,
				label: displayName,
				icon: getFolderIcon({ item, checked: !!item.checked }),
				iconColor: setCalendarColor({ color: item.color, rgb: item.rgb }).color,
				textProps: { size: 'small' }
			}) as AccordionItemType,
		[item, displayName]
	);
	return (
		<FittedRow>
			<Padding left="small">
				<Avatar
					label={accordionItem.label ?? ''}
					colorLabel={accordionItem.iconColor}
					size="medium"
				/>
			</Padding>
			<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
				<AccordionItem item={accordionItem} />
			</Tooltip>
		</FittedRow>
	);
};

export const FoldersComponent: FC<FoldersComponentProps> = ({ item }) => {
	const isRootAccount = useMemo(
		() => item.id === FOLDERS.USER_ROOT || (item as LinkFolder).oname === ROOT_NAME,
		[item]
	);

	const isRootSubSection =
		item.id === SIDEBAR_ROOT_SUBSECTION.CALENDARS || item.id === SIDEBAR_ROOT_SUBSECTION.GROUPS;

	const isAGroup = isGroupType(item);

	const isACalendar = isCalendarType(item);

	// hide folders where a share was provided and subsequently removed
	if ((item as LinkFolder).isLink && (item as LinkFolder).broken) {
		return <></>;
	}

	if (isRootAccount && isACalendar) {
		return <RootAccount item={item} />;
	}

	if (isRootSubSection && isACalendar) {
		return <RootSubsection item={item} />;
	}

	if (isAGroup) {
		return <RootGroupChildren item={item} />;
	}
	if (isACalendar) {
		return <RootCalendarChildren item={item} />;
	}
	return null;
};
