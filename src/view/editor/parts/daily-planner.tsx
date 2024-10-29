/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Chip, Container } from '@zextras/carbonio-design-system';

import { useAppSelector } from '../../../store/redux/hooks';
import { selectSender } from '../../../store/selectors/editor';

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const sender = useAppSelector(selectSender(editorId));
	return (
		<Container data-testid={`daily-planner-component-${editorId}`}>
			<Chip label={sender.fullName} />
		</Container>
	);
};
