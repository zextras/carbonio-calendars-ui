/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { DropdownItem } from '@zextras/carbonio-design-system';
import { filter, map, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EditorResourceComponent, Loader, normalizeResources } from './editor-resource-component';
import { searchResources } from '../../../soap/search-resources';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorEquipment } from '../../../store/selectors/editor';
import { editEditorEquipment } from '../../../store/slices/editor-slice';
import { useAppStatusStore } from '../../../store/zustand/store';
import { Resource } from '../../../types/editor';

export const NewEquipments = ({ editorId }: { editorId: string }): ReactElement | null => {
	const dispatch = useAppDispatch();
	const [t] = useTranslation();

	const equipmentValue = useAppSelector(selectEditorEquipment(editorId));

	const [options, setOptions] = useState<Array<DropdownItem>>([]);

	const onChange = useCallback(
		(e: Array<Resource>) => {
			if (e) {
				const newValue = e.length > 0 ? uniqBy(e, 'label') : [];
				dispatch(editEditorEquipment({ id: editorId, equipment: newValue }));
			}
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
	const onInputType = useCallback((e) => {
		if (e.textContent && e.textContent !== '') {
			setOptions([
				{
					id: 'loading',
					label: 'loading',
					customComponent: <Loader />,
					disabled: true
				}
			]);
			searchResources(e.textContent).then((response) => {
				if (!response.error) {
					const equipmentResource = filter(
						response.cn,
						(cn) => cn._attrs.zimbraCalResType === 'Equipment'
					);
					const remoteResources = map(equipmentResource, (result) => normalizeResources(result));

					const res = map(equipmentResource, (result) => ({
						id: result.fileAsStr,
						label: result.fileAsStr,
						icon: 'BriefcaseOutline',
						value: {
							label: result.fileAsStr,
							email: result._attrs.email,
							avatarIcon: 'BriefcaseOutline',
							avatarBackground: 'transparent',
							avatarColor: 'gray0'
						}
					}));
					useAppStatusStore.setState({ equipment: uniqBy(remoteResources, 'label') });
					setOptions(res);
				}
			});
		}
	}, []);

	return (
		<EditorResourceComponent
			onChange={onChange}
			editorId={editorId}
			onInputType={onInputType}
			placeholder={placeholder}
			resourcesValue={equipmentValue ?? []}
			options={options}
			setOptions={setOptions}
			warningLabel={warningLabel}
		/>
	);
};
