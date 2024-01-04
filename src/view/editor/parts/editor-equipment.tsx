/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useState, useMemo } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import { compact, find, map, xorBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import {
	EditorAvailabilityWarningRow,
	getIsBusyAtTimeOfTheEvent
} from './editor-availability-warning-row';
import { ResourceCustomDropdownComponent } from './resource-custom-dropdown-component';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorEquipment,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorStart,
	selectEditorAllDay,
	selectEditorUid
} from '../../../store/selectors/editor';
import { editEditorEquipment } from '../../../store/slices/editor-slice';
import { useEquipments } from '../../../store/zustand/hooks';
import { Resource } from '../../../types/editor';

export const EditorEquipment = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const equipments = useEquipments();

	const equipment = useAppSelector(selectEditorEquipment(editorId));
	const [selection, setSelection] = useState<Array<Resource> | undefined>(undefined);
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const uid = useAppSelector(selectEditorUid(editorId));

	const attendeesAvailabilityList = useAttendeesAvailability(start, equipments, uid);

	const onChange = useCallback(
		(e) => {
			if (e) {
				dispatch(editEditorEquipment({ id: editorId, equipment: e.length > 0 ? e : [] }));
			}
			setSelection(e);
		},
		[dispatch, editorId]
	);

	useEffect(() => {
		if (equipment && equipment?.length > 0) {
			const selected = compact(
				map(equipment, (eq) => find(equipments, (r) => eq.email === r.email))
			);
			if (selected.length > 0 && xorBy(selected, selection, 'id')?.length > 0) {
				setSelection(selected);
			}
		}
	}, [equipment, equipments, selection]);

	const equipmentsAvailability = useMemo(() => {
		if (!equipments?.length) {
			return [];
		}
		return map(equipments, (_equipment) => {
			const equipmentInList = find(attendeesAvailabilityList, ['email', _equipment.email]);

			if (equipmentInList) {
				const isBusyAtTimeOfEvent = getIsBusyAtTimeOfTheEvent(
					equipmentInList,
					start,
					end,
					attendeesAvailabilityList,
					allDay
				);

				if (isBusyAtTimeOfEvent) {
					return {
						..._equipment,
						email: _equipment?.email ?? _equipment?.label,
						customComponent: <ResourceCustomDropdownComponent label={_equipment.label} />
					};
				}
			}
			return {
				..._equipment,
				email: _equipment?.email ?? _equipment?.label
			};
		});
	}, [allDay, attendeesAvailabilityList, end, equipments, selection, start]);

	return equipmentsAvailability ? (
		<>
			<Select
				items={equipmentsAvailability}
				background={'gray5'}
				label={t('label.equipment', 'Equipment')}
				onChange={onChange}
				disabled={disabled?.meetingRoom}
				selection={selection}
				multiple
			/>
			<EditorAvailabilityWarningRow
				label={t(
					'attendees_equipments_unavailable',
					'One or more Equipments are not available at the selected time of the event'
				)}
				list={attendeesAvailabilityList}
				items={equipment ?? []}
				editorId={editorId}
			/>
		</>
	) : null;
};
