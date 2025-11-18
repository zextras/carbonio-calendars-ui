/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useAccordionItemOpenStatusStorage } from './use-accordion-item-open-status-storage';
import { useSecondaryBarTreeGroups } from './use-secondary-bar-tree-groups';
import { useSecondaryBarTreePrimaryCalendars } from './use-secondary-bar-tree-primary-account-calendars';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';

// TODO refactor to split calendars and groups into their own hooks
export const useSecondaryBarTreePrimaryAccount = (): AccordionItemType => {
	const [t] = useTranslation();
	const account = useUserAccount();
	const groupsItems = useSecondaryBarTreeGroups();
	const calendarsItems = useSecondaryBarTreePrimaryCalendars(FOLDERS.USER_ROOT);
	const { isOpen, setOpenStatus } = useAccordionItemOpenStatusStorage();

	const onPrimaryAccountOpen = useCallback(
		(accordionItemId: string): AccordionItemType['onOpen'] =>
			() =>
				setOpenStatus(accordionItemId, true),
		[setOpenStatus]
	);

	const onPrimaryAccountClose = useCallback(
		(accordionItemId: string): AccordionItemType['onClose'] =>
			() =>
				setOpenStatus(accordionItemId, false),
		[setOpenStatus]
	);

	return useMemo(
		() => ({
			id: FOLDERS.USER_ROOT,
			label: account?.name,
			CustomComponent: AccountAccordionItem,
			open: isOpen(FOLDERS.USER_ROOT),
			onOpen: onPrimaryAccountOpen(FOLDERS.USER_ROOT),
			onClose: onPrimaryAccountClose(FOLDERS.USER_ROOT),
			items: [
				{
					id: SIDEBAR_ROOT_SUBSECTION.CALENDARS,
					open: isOpen(SIDEBAR_ROOT_SUBSECTION.CALENDARS),
					label: t('label.calendars', 'Calendars'),
					onOpen: onPrimaryAccountOpen(SIDEBAR_ROOT_SUBSECTION.CALENDARS),
					onClose: onPrimaryAccountClose(SIDEBAR_ROOT_SUBSECTION.CALENDARS),
					items: calendarsItems
				},
				{
					id: SIDEBAR_ROOT_SUBSECTION.GROUPS,
					open: isOpen(SIDEBAR_ROOT_SUBSECTION.GROUPS),
					label: t('label.calendar_groups', 'Calendar groups'),
					onOpen: onPrimaryAccountOpen(SIDEBAR_ROOT_SUBSECTION.GROUPS),
					onClose: onPrimaryAccountClose(SIDEBAR_ROOT_SUBSECTION.GROUPS),
					items: groupsItems
				}
			]
		}),
		[
			account?.name,
			isOpen,
			onPrimaryAccountOpen,
			onPrimaryAccountClose,
			t,
			calendarsItems,
			groupsItems
		]
	);
};
