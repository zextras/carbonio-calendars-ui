/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import { compact, find, map, xorBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorEquipment, selectEditorDisabled } from '../../../store/selectors/editor';
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

	const onChange = useCallback(
		(e) => {
			if (e) {
				if (e.length > 0) {
					dispatch(editEditorEquipment({ id: editorId, equipment: e }));
				} else {
					dispatch(editEditorEquipment({ id: editorId, equipment: [] }));
				}
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

	return equipments ? (
		<Select
			items={equipments}
			background={'gray5'}
			label={t('label.equipment', 'Equipment')}
			onChange={onChange}
			disabled={disabled?.meetingRoom}
			selection={selection}
			multiple
		/>
	) : null;
};
