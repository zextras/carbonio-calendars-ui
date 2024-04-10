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
	Text
} from '@zextras/carbonio-design-system';
import { FOLDERS, ROOT_NAME, t, useUserAccount } from '@zextras/carbonio-shell-ui';
import styled from 'styled-components';

import { importCalendarICSFn } from '../../../actions/calendar-actions-fn';
import { getRootAccountId, useRoot } from '../../../carbonio-ui-commons/store/zustand/folder';
import { isRoot } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import {
	getFolderIcon,
	getFolderTranslatedName,
	isLinkChild,
	recursiveToggleCheck
} from '../../../commons/utilities';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar';
import { useCalendarActions } from '../../../hooks/use-calendar-actions';
import { useCheckedCalendarsQuery } from '../../../hooks/use-checked-calendars-query';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { NoOpRequest } from '../../../soap/noop-request';
import { useAppDispatch } from '../../../store/redux/hooks';
import { useRangeEnd, useRangeStart } from '../../../store/zustand/hooks';

type FoldersComponentProps = {
	item: Folder;
};

const FittedRow = styled(Row)`
	max-width: calc(100% - (2 * ${({ theme }): string => theme.sizes.padding.small}));
	height: 3rem;
`;

const FileInput = styled.input`
	display: none;
`;

const ContextMenuItem = ({
	children,
	inputRef,
	item
}: {
	children: React.JSX.Element;
	inputRef: React.RefObject<HTMLInputElement>;
	item: Folder;
}): React.JSX.Element => {
	const isAllCalendar = useMemo(() => hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR), [item]);
	const items = useCalendarActions(item, inputRef);

	return isAllCalendar ? (
		children
	) : (
		<Dropdown items={items} contextMenu width="100%" display="block">
			{children}
		</Dropdown>
	);
};

const RowWithIcon = (icon: string, color: string, tooltipText: string): React.JSX.Element => (
	<Padding left="small">
		<Tooltip placement="right" label={tooltipText}>
			<Row>
				<Icon icon={icon} color={color} size="medium" />
			</Row>
		</Tooltip>
	</Padding>
);

const RootChildren = ({
	accordionItem,
	item
}: {
	accordionItem: AccordionItemType;
	item: Folder;
}): React.JSX.Element => {
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();
	const inputRef = useRef<HTMLInputElement>(null);
	const createSnackbar = useSnackbar();
	const createModal = useModal();

	const user = useUserAccount();
	const rootAccountId = getRootAccountId(item.id);
	const root = useRoot(rootAccountId ?? FOLDERS.USER_ROOT);

	const onClick = useCallback(
		(): void =>
			recursiveToggleCheck({
				folder: item,
				checked: !!item.checked,
				dispatch,
				start,
				end,
				query
			}),
		[dispatch, end, item, query, start]
	);

	const sharedStatusIcon = useMemo(() => {
		if (item.isLink || isLinkChild(item)) {
			const tooltipText = t('tooltip.folder_linked_status', 'Linked to me');
			return RowWithIcon('Linked', 'linked', tooltipText);
		}
		if (item.acl?.grant) {
			const tooltipText = t('tooltip.calendar_sharing_status', {
				count: item?.acl?.grant?.length,
				defaultValue_one: 'Shared with 1 person',
				defaultValue: 'Shared with {{count}} people'
			});
			return RowWithIcon('Shared', 'shared', tooltipText);
		}
		return '';
	}, [item]);

	const userMail = useMemo(
		() => (root?.name === ROOT_NAME ? user.name : root?.name ?? user.name),
		[root, user.name]
	);

	const confirmModal = useCallback(() => {
		if (inputRef?.current?.files) {
			createSnackbar({
				key: `import ongoing`,
				replace: true,
				type: 'info',
				label: t('label.import_calendar_ongoing', 'Import into the selected calendar in progress.'),
				hideButton: true
			});
			importCalendarICSFn(inputRef?.current?.files, userMail, item.name).then((res) => {
				if (res[0].status === 200) {
					NoOpRequest().then(() => {
						createSnackbar({
							key: `import success`,
							replace: true,
							type: 'success',
							label: t('label.import_calendar_success', 'Import successful'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					});
				} else {
					createSnackbar({
						key: `import failed`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		}
	}, [createSnackbar, item.name, userMail]);

	const onFileInputChange = useCallback(() => {
		if (inputRef?.current?.files) {
			const closeModal = createModal(
				{
					size: 'small',
					children: (
						<>
							<ModalHeader
								title={t('import_appointments', 'Import appointments')}
								showCloseIcon
								onClose={(): void => {
									closeModal();
								}}
							/>
							<Divider />
							<ModalBody>
								<Text overflow="break-word">
									{t('message.import_appointment_modal', {
										fileName: inputRef?.current?.files[0].name,
										calendarName: item.name,
										defaultValue:
											'The appointments contained within {{fileName}} will be imported into the "{{calendarName}}" calendar.'
									})}
								</Text>
							</ModalBody>
							<Divider />
							<ModalFooter
								onConfirm={(): void => {
									closeModal();
									confirmModal();
								}}
								onClose={(): void => {
									closeModal();
								}}
								confirmLabel={t('import', 'Import')}
							/>
						</>
					),
					onClose: () => {
						closeModal();
					}
				},
				true
			);
		}
	}, [confirmModal, createModal, item.name]);

	return (
		<>
			<ContextMenuItem item={item} inputRef={inputRef}>
				<Row onClick={onClick}>
					<Padding left="small" />
					<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
						<AccordionItem item={accordionItem} />
					</Tooltip>
					{sharedStatusIcon}
				</Row>
			</ContextMenuItem>
			<FileInput type="file" ref={inputRef} onChange={onFileInputChange} accept=".ics" />
		</>
	);
};

const RootAccount = ({
	accordionItem
}: {
	accordionItem: AccordionItemType;
}): React.JSX.Element => (
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

export const FoldersComponent: FC<FoldersComponentProps> = ({ item }) => {
	const { displayName } = useUserAccount();
	const isRootAccount = useMemo(() => isRoot(item), [item]);
	const accordionItem = useMemo(
		() =>
			({
				...item,
				label:
					item.id === FOLDERS.USER_ROOT
						? displayName
						: getFolderTranslatedName({ folderId: item.id, folderName: item.name }) ?? '',
				icon: getFolderIcon({ item, checked: !!item.checked }),
				iconColor: setCalendarColor({ color: item.color, rgb: item.rgb }).color,
				textProps: { size: 'small' }
			}) as AccordionItemType,
		[item, displayName]
	);

	// hide folders where a share was provided and subsequently removed
	if (item.isLink && item.broken) {
		return <></>;
	}

	if (isRootAccount) {
		return <RootAccount accordionItem={accordionItem} />;
	}

	return <RootChildren accordionItem={accordionItem} item={item} />;
};
