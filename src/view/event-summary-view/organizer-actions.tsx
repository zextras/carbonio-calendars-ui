/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { noop } from 'lodash';
import React, { FC, ReactElement, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Dropdown,
	ModalManagerContext,
	Padding,
	SnackbarManagerContext,
	Row
} from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import { editAppointment } from '../../actions/appointment-actions-fn';
import { PANEL_VIEW } from '../../constants';
import { useCalendarFolders } from '../../hooks/use-calendar-folders';
import { ActionsContext, PanelView } from '../../types/actions';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { createAndApplyTag } from '../tags/tag-actions';

const OrganizerActions: FC<{ event: EventType; invite: Invite; actions: any }> = ({
	event,
	invite,
	actions
}): ReactElement | null => {
	const createModal = useContext(ModalManagerContext);
	const calendarFolders = useCalendarFolders();
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = useMemo<ActionsContext>(
		() => ({
			replaceHistory,
			dispatch,
			createModal,
			createSnackbar,
			tags,
			folders: calendarFolders,
			createAndApplyTag,
			isInstance: true,
			ridZ: event.resource.ridZ,
			panelView: PANEL_VIEW.APP as PanelView
		}),
		[calendarFolders, createModal, createSnackbar, dispatch, event.resource.ridZ, tags]
	);
	const onClick = useMemo(
		() => editAppointment({ event, invite, context }),
		[context, event, invite]
	);

	return event ? (
		<>
			{event.resource?.calendar?.name === 'Trash' ? (
				<Button
					type="outlined"
					disabled={!event.haveWriteAccess}
					label={t('label.move', 'move')}
					onClick={(): void => console.warn('not implemented yet')}
				/>
			) : (
				<Button
					disabled={!event.haveWriteAccess}
					type="outlined"
					label={t('label.edit', 'edit')}
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					onClick={onClick}
				/>
			)}

			<Padding left="small">
				<Dropdown items={actions} placement="bottom-end">
					<Row>
						<Button
							type="outlined"
							label={t('label.other_actions', 'Other actions')}
							icon="ChevronDown"
							onClick={noop}
						/>
					</Row>
				</Dropdown>
			</Padding>
		</>
	) : null;
};

export default OrganizerActions;
