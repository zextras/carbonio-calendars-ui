/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Row } from '@zextras/carbonio-design-system';
import { filter, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EditorResourceComponent, normalizeResources } from './editor-resource-component';
import { searchResources } from '../../../soap/search-resources';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorEquipment } from '../../../store/selectors/editor';
import { editEditorEquipment } from '../../../store/slices/editor-slice';
import { useAppStatusStore } from '../../../store/zustand/store';
import { ChipResource } from '../../../types/editor';

export const EditorEquipments = ({ editorId }: { editorId: string }): ReactElement | null => {
	const dispatch = useAppDispatch();
	const [t] = useTranslation();
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const equipmentValue = useAppSelector(selectEditorEquipment(editorId));
	const hasEquipments = useAppStatusStore((state) => state.equipment ?? []).length > 0;

	const equipmentChipValue = useMemo(
		() =>
			map(equipmentValue, (resource) => ({
				id: resource.id,
				label: resource.label,
				email: resource.email,
				avatarIcon: 'BriefcaseOutline' as const,
				avatarBackground: 'transparent' as const,
				avatarColor: 'gray0' as const
			})),
		[equipmentValue]
	);

	const onChange = useCallback(
		(chips: Array<ChipResource>) => {
			dispatch(editEditorEquipment({ id: editorId, equipment: chips }));
		},
		[dispatch, editorId]
	);

	const onSearchOptions = useCallback(
		(searchedValued: string) =>
			searchResources(searchedValued).then((response) => {
				if (!response.error) {
					const equipmentResource = filter(
						response.cn,
						(cn) => cn._attrs.zimbraCalResType === 'Equipment'
					);
					return map(equipmentResource, (result) => ({
						id: result.fileAsStr,
						label: result.fileAsStr,
						icon: 'BriefcaseOutline',
						value: normalizeResources(result)
					}));
				}
				throw new Error('received error from API');
			}),
		[]
	);

	return !hasEquipments ? (
		<></>
	) : (
		<Row height="fit" width="fill" padding={{ top: 'large' }}>
			<EditorResourceComponent
				onChange={onChange}
				editorId={editorId}
				onSearchOptions={onSearchOptions}
				placeholder={t('label.equipment', 'Equipment')}
				resourcesValue={equipmentChipValue}
				warningLabel={t(
					'attendees_equipments_unavailable',
					'One or more Equipments are not available at the selected time of the event'
				)}
				disabled={disabled?.equipment}
				singleWarningLabel={t(
					'attendee_equipment_unavailable',
					'Equipment not available at the selected time of the event'
				)}
			/>
		</Row>
	);
};
