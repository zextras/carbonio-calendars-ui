/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useState } from 'react';

import { Icon, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { EditorEquipments } from './editor-equipments';
import { EditorMeetingRooms } from './editor-meeting-rooms';
import { useFetchEditorResources } from '../use-fetch-editor-resources';

export const EditorResources = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const [error, setError] = useState<boolean>(false);
	const onResourceFetchFailure = useCallback(() => {
		setError(true);
	}, []);

	const { resourcesLoaded, hasMeetingRoom, hasEquipment } = useFetchEditorResources({
		onFailure: onResourceFetchFailure
	});

	const loadingLabel = t(
		'label.loading_resources',
		'Loading “Meeting room” and “Equipment”, please wait...'
	);

	const errorLabel = t(
		'label.resources_load_error',
		"Couldn't load “Meeting room” and “Equipment”. Try closing and reopening the board."
	);

	if (!resourcesLoaded && !error) {
		return (
			<Row
				takeAvailableSpace
				mainAlignment="flex-start"
				gap={'0.5rem'}
				padding={{ top: 'large' }}
				style={{ alignItems: 'center' }}
			>
				<Icon icon="LoaderOutline" color={'gray0'} />
				<Text color={'gray1'} size={'medium'}>
					{loadingLabel}
				</Text>
			</Row>
		);
	}

	if (resourcesLoaded && error) {
		return (
			<Row
				takeAvailableSpace
				mainAlignment="flex-start"
				gap={'0.5rem'}
				padding={{ top: 'large' }}
				style={{ alignItems: 'center' }}
			>
				<Icon icon={'AlertTriangleOutline'} color={'error'} />
				<Text color={'error'} size={'medium'}>
					{errorLabel}
				</Text>
			</Row>
		);
	}

	return (
		<>
			{hasMeetingRoom && (
				<Row height={'fit'} width={'fill'} padding={{ top: 'large' }}>
					<EditorMeetingRooms editorId={editorId} />
				</Row>
			)}
			{hasEquipment && (
				<Row height={'fit'} width={'fill'} padding={{ top: 'large' }}>
					<EditorEquipments editorId={editorId} />
				</Row>
			)}
		</>
	);
};
