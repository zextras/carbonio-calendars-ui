/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { ChipInput, ChipItem } from '@zextras/carbonio-design-system';
import { LinkFolder } from '@zextras/carbonio-shell-ui';
import { filter, map, reject, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ROOT_NAME } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { isTrashOrNestedInIt } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { ItemFactory } from '../../editor/parts/select-label-factory';

type ChipInputItems = ChipItem<{ id: string; label: string }>[];

export type MultiCalendarSelectorProps = {
	onCalendarChange: (selectedCalendars: ChipInputItems) => void;
	excludeTrash?: boolean;
	disabled?: boolean;
};

export const MultiCalendarSelector = ({
	onCalendarChange,
	excludeTrash = false,
	disabled
}: MultiCalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const [selectedCalendars, setSelectedCalendars] = useState<ChipInputItems>([]);

	const allCalendars = useFoldersMap();

	const calendars = reject(
		allCalendars,
		(item) => item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME
	);

	const requiredCalendars = useMemo(
		() => (excludeTrash ? filter(calendars, (cal) => !isTrashOrNestedInIt(cal)) : calendars),
		[calendars, excludeTrash]
	);

	const calendarItems = useMemo(
		() =>
			map(requiredCalendars, (cal) => {
				const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
				const labelName = hasId(cal, FOLDERS.CALENDAR) ? t('label.calendar', 'Calendar') : cal.name;
				return {
					...cal,
					label: labelName,
					value: { id: cal.id, label: labelName },
					color: color.color,
					customComponent: (
						<ItemFactory
							disabled={disabled ?? false}
							absFolderPath={cal.absFolderPath}
							color={color.color}
							isLink={cal.isLink}
							label={labelName}
							acl={cal.acl}
							id={cal.id}
						/>
					)
				};
			}),
		[disabled, requiredCalendars, t]
	);

	const onSelectedCalendarsChange = useCallback((selected: ChipInputItems) => {
		const selectedChips = uniqBy(selected, 'id');
		setSelectedCalendars(selectedChips);
	}, []);

	const onIconAction = useCallback(
		(ev) => {
			ev?.stopPropagation();
			onCalendarChange(selectedCalendars);
			setSelectedCalendars([]);
		},
		[onCalendarChange, selectedCalendars]
	);

	return (
		<ChipInput
			data-testid={'calendar-selector-input'}
			options={calendarItems}
			disableOptions={false}
			value={selectedCalendars}
			onChange={onSelectedCalendarsChange}
			placeholder={t('label.calendar_selector.placeholder', 'Add Calendars')}
			requireUniqueChips
			icon={'Plus'}
			iconAction={onIconAction}
		/>
	);
};
