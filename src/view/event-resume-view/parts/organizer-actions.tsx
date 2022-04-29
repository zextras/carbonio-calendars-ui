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

import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';

import { map } from 'lodash';
import { useDispatch } from 'react-redux';
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';

import { applyTag } from '../../tags/tag-actions';
import { moveApptToTrash, openInDisplayer } from '../../../hooks/use-event-actions';

const OrganizerActions: FC<{ event: any; onClose: any }> = ({ event, onClose }): ReactElement => {
	const createModal = useContext(ModalManagerContext);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = useMemo(
		() => ({ replaceHistory, dispatch, createModal, createSnackbar, tags }),
		[createModal, createSnackbar, dispatch, tags]
	);
	const otherActions = useMemo(
		() => [
			moveApptToTrash(event, { ...context, isInstance: true }, t),
			openInDisplayer(event, context, t),
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			applyTag({ t, context, event })
		],
		[context, event, t]
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
						replaceHistory(
							`/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}`
						);
					}}
				/>
			)}

			<Padding left="small">
				<Dropdown
					disableAutoFocus
					items={map(otherActions, (action) => ({
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
					}))}
					placement="bottom-end"
				>
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
