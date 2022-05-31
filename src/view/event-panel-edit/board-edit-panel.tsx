/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { useBoardConfig } from '@zextras/carbonio-shell-ui';
import EventEditPanel from './event-edit-panel';

const BoardEditPanel = (): JSX.Element => {
	const context = useBoardConfig<object>();
	const boardContext = useMemo(() => ({ ...context, isBoard: true }), [context]);
	return <EventEditPanel boardContext={boardContext} />;
};
export default BoardEditPanel;
