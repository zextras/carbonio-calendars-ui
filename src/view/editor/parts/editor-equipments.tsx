/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { filter, map, uniqBy } from 'lodash';
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

	const equipmentChipValue: Array<ChipResource> = useMemo(
		() =>
			map(equipmentValue, (resource) => ({
				id: resource.id,
				label: resource.label,
				email: resource.email,
				avatarIcon: 'BriefcaseOutline',
				avatarBackground: 'transparent',
				avatarColor: 'gray0'
			})),
		[equipmentValue]
	);

	const onChange = useCallback(
		(chips: Array<ChipResource>) => {
			const newValue = uniqBy(chips, 'label');
			dispatch(editEditorEquipment({ id: editorId, equipment: newValue }));
		},
		[dispatch, editorId]
	);

	const placeholder = useMemo(() => t('label.equipment', 'Equipment'), [t]);
	const warningLabel = useMemo(
		() =>
			t(
				'attendees_equipments_unavailable',
				'One or more Equipments are not available at the selected time of the event'
			),
		[t]
	);
	const singleWarningLabel = useMemo(
		() =>
			t(
				'attendee_equipment_unavailable',
				'Equipment not available at the selected time of the event'
			),
		[t]
	);

	const onSearchOptions = useCallback(
		(searchedValued: string) =>
			searchResources(searchedValued).then((response) => {
				if (!response.error) {
					const equipmentResource = filter(
						response.cn,
						(cn) => cn._attrs.zimbraCalResType === 'Equipment'
					);
					const remoteResources = map(equipmentResource, (result) => normalizeResources(result));
					const searchOptions = map(equipmentResource, (result) => ({
						id: result.fileAsStr,
						label: result.fileAsStr,
						icon: 'BriefcaseOutline',
						value: normalizeResources(result)
					}));
					useAppStatusStore.setState({ equipment: uniqBy(remoteResources, 'label') });
					return searchOptions;
				}
				throw new Error('received error from API');
			}),
		[]
	);

	return (
		<EditorResourceComponent
			onChange={onChange}
			editorId={editorId}
			onSearchOptions={onSearchOptions}
			placeholder={placeholder}
			resourcesValue={equipmentChipValue ?? []}
			warningLabel={warningLabel}
			disabled={disabled?.equipment}
			singleWarningLabel={singleWarningLabel}
		/>
	);
};
