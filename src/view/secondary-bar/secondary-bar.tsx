/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import {
	Accordion,
	AccordionItemType,
	ModalManager,
	SnackbarManager
} from '@zextras/carbonio-design-system';
import { SecondaryBarComponentProps } from '@zextras/carbonio-shell-ui';
import { useRootsMap } from '@zextras/carbonio-ui-commons';

const SecondaryBar: FC<SecondaryBarComponentProps> = ({ expanded }) => {
	const onCalendarSelected = (calendarId: string) => {
		// Handle calendar selection
	};

	const onGroupSelected = (groupId: string) => {
		// Handle group selection
	};

	const onTagSelected = (tagId: string) => {
		// Handle tag selection
	};

	// Obtain the accounts list
	const accounts = useRootsMap();

	// Obtain the calendars list for each account

	// Obtain the calendars groups for the primary account

	// Obtain the tags list for the primary account

	// Generate tags accordion item for the primary account

	// Generate calendar groups accordion item for the primary account

	// Generate "Calendar" aggregator accordion item

	// Generate "Tags" aggregator accordion item

	// Generate "Calendar groups" aggregator accordion item

	// Generate "Find shares" custom accordion item

	// Generate "Create group" custom accordion item

	const rootItems: Array<AccordionItemType> = [];

	const accountsItems = Object.values(accounts).map((account) => ({
		id: `calendars-${account.id}`,
		label: account.name
	}));

	// Generate calendars accordion items for each account
	Object.values(accounts).forEach((account) => {
		rootItems.push({
			id: `calendars-${account.id}`,
			label: account.name
		} satisfies AccordionItemType);
	});

	// Compose the accordion items

	return (
		<ModalManager>
			<SnackbarManager>
				<Accordion items={rootItems} />
			</SnackbarManager>
		</ModalManager>
	);
};

export default SecondaryBar;
