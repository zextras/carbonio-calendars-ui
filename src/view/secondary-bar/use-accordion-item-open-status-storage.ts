/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useLocalStorage } from '@zextras/carbonio-shell-ui';

export const useAccordionItemOpenStatusStorage = (
	accordionItemId: string
): { isOpen: boolean; setOpenStatus: (isOpen: boolean) => void } => {
	const [openAccordionItems, setOpenAccordionItems] = useLocalStorage<Array<string>>(
		'open_calendars_folders',
		[]
	);

	const isOpen = useMemo(
		() => openAccordionItems.includes(accordionItemId),
		[openAccordionItems, accordionItemId]
	);

	const setOpenStatus = useCallback(
		(status: boolean): void => {
			if (status) {
				setOpenAccordionItems([...openAccordionItems, accordionItemId]);
			} else {
				setOpenAccordionItems(openAccordionItems.filter((id) => id !== accordionItemId));
			}
		},
		[setOpenAccordionItems, openAccordionItems, accordionItemId]
	);

	return { isOpen, setOpenStatus };
};
