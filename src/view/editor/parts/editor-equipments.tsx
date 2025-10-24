/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { filter, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EditorResourceComponent, normalizeResources } from './editor-resource-component';
import { generateResourceId, isValidResource } from './utils';
import { searchResources } from '../../../soap/search-resources';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorEquipment } from '../../../store/selectors/editor';
import { editEditorEquipment } from '../../../store/slices/editor-slice';
import { ChipResource } from '../../../types/editor';

export const EditorEquipments = ({ editorId }: { editorId: string }): ReactElement | null => {
	const dispatch = useAppDispatch();
	const [t] = useTranslation();
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const equipmentValue = useAppSelector(selectEditorEquipment(editorId));

	const equipmentChipValue = useMemo(
		() =>
			map(equipmentValue, (resource) => {
				const isValid = isValidResource(resource);
				return {
					id: resource.id ?? generateResourceId(resource),
					label: resource.label,
					email: resource.email,
					avatarIcon: isValid ? 'BriefcaseOutline' : 'AlertCircleOutline',
					avatarBackground: 'transparent' as const,
					avatarColor: 'gray0' as const
				};
			}),
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
				if (response && !response.error) {
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
				throw new Error('API failed');
			}),
		[]
	);

	const errorLabels = {
		singleResourceUnavailable: t(
			'attendee_equipment_unavailable',
			'Equipment not available at the selected time of the event'
		),
		multipleResourcesUnavailable: t(
			'attendees_equipments_unavailable',
			'One or more Equipments are not available at the selected time of the event'
		),
		invalidResource: t(
			'equipment_invalid',
			'One or more items of equipment are invalid. Try editing them or entering a new one.'
		),
		duplicateResources: t(
			'duplicate_equipment_error',
			'One or more items of equipment were selected multiple times. Consider removing the duplicates.'
		)
	};
	return (
		<EditorResourceComponent
			onChange={onChange}
			editorId={editorId}
			onSearchOptions={onSearchOptions}
			placeholder={t('label.equipment', 'Equipment')}
			resourcesValue={equipmentChipValue}
			disabled={disabled?.equipment}
			errorLabels={errorLabels}
		/>
	);
};
