/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useAccordionItemOpenStatusStorage } from './use-accordion-item-open-status-storage';
import { useSecondaryBarTreeGroups } from './use-secondary-bar-tree-groups';
import { useSecondaryBarTreePrimaryCalendars } from './use-secondary-bar-tree-primary-account-calendars';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';

export const useSecondaryBarTreePrimaryAccount = (): AccordionItemType => {
	const account = useUserAccount();
	const groupsItems = useSecondaryBarTreeGroups();
	const calendarsItems = useSecondaryBarTreePrimaryCalendars(FOLDERS.USER_ROOT);
	const { isOpen, setOpenStatus } = useAccordionItemOpenStatusStorage(FOLDERS.USER_ROOT);

	const onAccordionItemOpen = useCallback(() => {
		setOpenStatus(true);
	}, [setOpenStatus]);

	const onAccordionItemClose = useCallback(() => {
		setOpenStatus(false);
	}, [setOpenStatus]);

	return useMemo(
		() => ({
			id: FOLDERS.USER_ROOT,
			label: account?.name,
			CustomComponent: AccountAccordionItem,
			open: isOpen,
			onOpen: onAccordionItemOpen,
			onClose: onAccordionItemClose,
			items: [
				{ id: SIDEBAR_ROOT_SUBSECTION.CALENDARS, label: 'Calendars', items: calendarsItems },
				{ id: SIDEBAR_ROOT_SUBSECTION.GROUPS, label: 'Groups', items: groupsItems }
			]
		}),
		[account?.name, isOpen, onAccordionItemOpen, onAccordionItemClose, calendarsItems, groupsItems]
	);
};
