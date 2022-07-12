/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import EventEditPanel from './event-edit-panel';

const BoardEditPanel = ({ board }) => {
	const boardContext = useMemo(() => ({ ...board.context, isBoard: true }), [board]);
	return <EventEditPanel boardContext={boardContext} />;
};
export default BoardEditPanel;
