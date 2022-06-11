/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { FOLDERS, getBridgedFunctions, replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { useDispatch } from 'react-redux';
import { CALENDAR_ROUTE } from '../../constants';
import { generateEditor } from '../../commons/editor-generator';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { applyTag, createAndApplyTag } from '../tags/tag-actions';
import { moveApptToTrash, openInDisplayer, deletePermanently } from '../../hooks/use-event-actions';

const OrganizerActions: FC<{ event: any; onClose: any }> = ({ event, onClose }): ReactElement => {
	const createModal = useContext(ModalManagerContext);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = useMemo(
		() => ({ replaceHistory, dispatch, createModal, createSnackbar, tags, createAndApplyTag }),
		[createModal, createSnackbar, dispatch, tags]
	);

	const otherActions = useMemo(
		() => [
			event.resource.calendar.id === FOLDERS.TRASH
				? deletePermanently({ event, context, t })
				: moveApptToTrash(event, { ...context, isInstance: true }, t),
			openInDisplayer(event, context, t),
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			applyTag({ t, context, event })
		],
		[context, event, t]
	);

	const otherActionsOptions = useMemo(
		() =>
			map(otherActions, (action) => ({
				id: action.label,
				icon: action.icon,
				label: action.label,
				key: action.id,
				color: action.color,
				items: action.items,
				customComponent: action.customComponent,
				click: (ev: any): void => {
					ev.stopPropagation();
					action.click();
				}
			})),
		[otherActions]
	);
	return (
		<>
			{event.resource?.calendar?.name === 'Trash' ? (
				<Button
					type="outlined"
					disabled={!event.permission}
					label={t('label.move', 'move')}
					onClick={(): void => console.warn('not implemented yet')}
				/>
			) : (
				<Button
					disabled={!event.haveWriteAccess}
					type="outlined"
					label={t('label.edit', 'edit')}
					onClick={(ev: any): void => {
						if (ev) ev.stopPropagation();
						onClose();
						const boardContext = {
							organizer: event.resource.organizer,
							title: event.title,
							location: event.resource.location,
							room: event.resource.room,
							attendees: [],
							optionalAttendees: [],
							allDay: event.allDay,
							freeBusy: event.resource.freeBusy,
							class: event.resource.class,
							start: event.start.valueOf(),
							end: event.end.valueOf()
						};
						const { editor } = generateEditor(event.resource.id, boardContext);
						replaceHistory(`/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${editor.id}`);
					}}
				/>
			)}

			<Padding left="small">
				<Dropdown disableAutoFocus items={otherActionsOptions} placement="bottom-end">
					<Row>
						<Button
							type="outlined"
							label={t('label.other_actions', 'Other actions')}
							icon="ArrowIosDownwardOutline"
						/>
					</Row>
				</Dropdown>
			</Padding>
		</>
	);
};

export default OrganizerActions;
