/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Select, SingleSelectionOnChange } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import {
	ROOT_NAME,
	FOLDERS,
	Folders,
	getFolderIdParts,
	getFolderOtherOwnerAccountName,
	getRootAccountId,
	isLink,
	useFoldersMap,
	useFoldersMapByRoot,
	useRootsMap,
	isTrashOrNestedInIt,
	Folder,
	LinkFolder,
	hasId
} from '@zextras/carbonio-ui-commons';
import { filter, find, map, reject, sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import LabelFactory, { ItemFactory } from './select-label-factory';
import { getCalendarOwnerEmail } from '../../../commons/utilities';
import { PREFS_DEFAULTS } from '../../../constants';
import {
	setCalendarColor,
	setCalendarColorFromNumber
} from '../../../normalizations/normalizations-utils';

type CalendarSelectorProps = {
	calendarId: string;
	onCalendarChange: (calendar: Folder) => void;
	label?: string;
	excludeTrash?: boolean;
	showCalWithWritePerm?: boolean;
	disabled?: boolean;
	allowAllAccounts?: boolean;
};

/**
 * Keeps the flat list readable when calendars of several accounts are mixed together:
 * the user's own calendars come first, then the shares mounted in their root, then the
 * calendars of every shared account, grouped by owning account.
 */
const getSortCriteria =
	(roots: Folders) =>
	(folder: Folder): string => {
		const { zid } = getFolderIdParts(folder.id);
		const name = folder.name.toLowerCase();

		if (zid) {
			const accountName = getFolderOtherOwnerAccountName(folder.id, roots) ?? zid;
			return `4000-${accountName.toLowerCase()}-${name}`;
		}

		if (isLink(folder)) {
			return `3000-${name}`;
		}

		if (hasId(folder, FOLDERS.CALENDAR)) {
			return '1000';
		}

		return `2000-${name}`;
	};

export const CalendarSelector = ({
	calendarId,
	onCalendarChange,
	label,
	excludeTrash = false,
	showCalWithWritePerm = true,
	disabled,
	allowAllAccounts = false
}: CalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const rootAccountId = getRootAccountId(calendarId);

	const allCalendarsByRoot = useFoldersMapByRoot(rootAccountId ?? FOLDERS.USER_ROOT);
	const allCalendars = useFoldersMap();

	const calendars = reject(
		!allowAllAccounts && rootAccountId?.includes(':') ? allCalendarsByRoot : allCalendars,
		(item) => item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME
	);

	const { zimbraPrefDefaultCalendarId } = useUserSettings().prefs;
	const roots = useRootsMap();

	const calWithWritePerm = useMemo(
		() =>
			showCalWithWritePerm
				? filter(calendars, (calendar) =>
						calendar.perm ? /w/.test(calendar.perm) : !(calendar as LinkFolder).owner
					)
				: calendars,
		[calendars, showCalWithWritePerm]
	);

	const requiredCalendars = useMemo(
		() =>
			sortBy(
				excludeTrash
					? filter(calWithWritePerm, (cal) => !isTrashOrNestedInIt(cal))
					: calWithWritePerm,
				getSortCriteria(roots)
			),
		[calWithWritePerm, excludeTrash, roots]
	);
	const calendarItems = useMemo(
		() =>
			map(requiredCalendars, (cal) => {
				const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
				const labelName = hasId(cal, FOLDERS.CALENDAR) ? t('label.calendar', 'Calendar') : cal.name;
				const ownerEmail = getCalendarOwnerEmail(cal);
				return {
					...cal,
					label: labelName,
					value: cal.id,
					color: color.color,
					ownerEmail,
					customComponent: (
						<ItemFactory
							disabled={disabled ?? false}
							absFolderPath={cal.absFolderPath}
							color={color.color}
							isLink={cal.isLink}
							label={labelName}
							acl={cal.acl}
							ownerEmail={ownerEmail}
						/>
					)
				};
			}),
		[disabled, requiredCalendars, t]
	);

	const defaultCalendarSelection = useMemo(() => {
		const defaultCal = find(requiredCalendars, [
			'id',
			zimbraPrefDefaultCalendarId ?? PREFS_DEFAULTS?.DEFAULT_CALENDAR_ID
		]);
		const defaultCalendar = {
			id: requiredCalendars?.[0]?.id ?? defaultCal?.id,
			acl: requiredCalendars?.[0]?.acl ?? defaultCal?.acl,
			isLink: requiredCalendars?.[0]?.isLink ?? defaultCal?.isLink,
			absFolderPath: requiredCalendars?.[0]?.absFolderPath ?? defaultCal?.absFolderPath,
			value: requiredCalendars?.[0]?.id ?? defaultCal?.id,
			label: requiredCalendars?.[0]?.name ?? defaultCal?.name,
			color: requiredCalendars?.[0]?.color
				? setCalendarColorFromNumber(requiredCalendars?.[0]?.color).color
				: defaultCal?.color
		};
		return find(calendarItems, ['value', calendarId]) ?? defaultCalendar;
	}, [requiredCalendars, zimbraPrefDefaultCalendarId, calendarItems, calendarId]);

	const onSelectedCalendarChange = useCallback<SingleSelectionOnChange>(
		(id) => {
			const calendar = find(calendars, ['id', id]) ?? requiredCalendars[0];
			return onCalendarChange(calendar);
		},
		[calendars, onCalendarChange, requiredCalendars]
	);

	return calendars && defaultCalendarSelection ? (
		<Select
			data-testid={'calendar-selector'}
			label={label || t('label.calendar', 'Calendar')}
			onChange={onSelectedCalendarChange}
			items={calendarItems}
			maxWidth={'fill'}
			selection={defaultCalendarSelection}
			disablePortal
			disabled={disabled}
			LabelFactory={LabelFactory}
		/>
	) : null;
};
