/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useState } from 'react';

import { Container, Icon, Row, Text } from '@zextras/carbonio-design-system';

import { EditorEquipments } from './editor-equipments';
import { EditorMeetingRooms } from './editor-meeting-rooms';
import { useFetchEditorResources } from '../use-fetch-editor-resources';

export const EditorResources = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [error, setError] = useState<boolean>(false);
	const onResourceFetchFailure = useCallback(() => {
		setError(true);
	}, []);

	const { resourcesLoaded, hasMeetingRoom, hasEquipment } = useFetchEditorResources({
		onFailure: onResourceFetchFailure
	});

	if (!resourcesLoaded && !error) {
		return (
			<Row takeAvailableSpace mainAlignment="flex-start" gap={'small'}>
				<Icon icon="LoaderOutline" />
				<Text>Loading “Meeting room” and “Equipment”, please wait...</Text>
			</Row>
		);
	}

	if (resourcesLoaded && error) {
		return (
			<Container
				height="100%"
				width="100%"
				mainAlignment="center"
				crossAlignment="center"
				background="gray5"
			>
				<p>Error loading resources. Please try again later.</p>
			</Container>
		);
	}

	return (
		<>
			{hasMeetingRoom && (
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorMeetingRooms editorId={editorId} />
				</Row>
			)}
			{hasEquipment && (
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorEquipments editorId={editorId} />
				</Row>
			)}
		</>
	);
};
