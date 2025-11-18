/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useLocalStorage } from '@zextras/carbonio-shell-ui';

export const useAccordionItemOpenStatusStorage = (): {
	isOpen: (accordionItemId: string) => boolean;
	setOpenStatus: (accordionItemId: string, isOpen: boolean) => void;
} => {
	const [openAccordionItems, setOpenAccordionItems] = useLocalStorage<Array<string>>(
		'open_calendars_folders',
		[]
	);

	const isOpen = useCallback(
		(accordionItemId: string) => openAccordionItems.includes(accordionItemId),
		[openAccordionItems]
	);

	const setOpenStatus = useCallback(
		(accordionItemId: string, status: boolean): void => {
			if (status) {
				setOpenAccordionItems([...openAccordionItems, accordionItemId]);
			} else {
				setOpenAccordionItems(openAccordionItems.filter((id) => id !== accordionItemId));
			}
		},
		[setOpenAccordionItems, openAccordionItems]
	);

	return { isOpen, setOpenStatus };
};
