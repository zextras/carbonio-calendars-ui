/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import {
	Divider,
	Icon,
	IconButton,
	Padding,
	Row,
	Text,
	useHiddenCount
} from '@zextras/carbonio-design-system';
import React, { useEffect, useRef } from 'react';
import { map, some } from 'lodash';

const ActionButtons = ({ actions, closeAction }) => {
	const actionContainerRef = useRef();
	const [hiddenActionsCount, recalculateHiddenActions] = useHiddenCount(actionContainerRef, true);

	useEffect(() => {
		recalculateHiddenActions();
	}, [actions, recalculateHiddenActions]);
	// todo: do we use it?
	return (
		<Row wrap="nowrap" height="100%" mainAlignment="flex-end" style={{ maxWidth: '160px' }}>
			<Row
				//	ref={actionContainerRef}
				height="40px"
				mainAlignment="flex-start"
				style={{ overflow: 'hidden' }}
			>
				{actions &&
					map(actions, (action) => (
						<IconButton key={action.id} icon={action.icon} onClick={action.click} />
					))}
			</Row>
			{/* IconButton disabled until the actions are active 
			<Padding right="medium">
				<IconButton icon="MoreVertical" />
			</Padding>
			*/}
		</Row>
	);
};

const ExpandButton = ({ actions }) => (
	<Row height="40px" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
		{actions &&
			map(actions, (action) => (
				<IconButton key={action.id} icon={action.icon} onClick={action.click} />
			))}
	</Row>
);

export const Header = ({ title, closeAction, actions }) => {
	const [t] = useTranslation();
	const eventIsEditable = some(actions, { id: 'edit' });
	const expandedButton = some(actions, { id: 'expand' });
	return (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray5"
				width="fill"
				height="48px"
				padding={{ vertical: 'small' }}
			>
				<Row padding={{ horizontal: 'large' }}>
					<Icon icon={eventIsEditable ? 'NewAppointmentOutline' : 'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{title || t('label.no_subject', 'No subject')}
					</Text>
				</Row>
				{expandedButton && <ExpandButton actions={actions} />}

				{/* TODO: uncomment the code once the actions are in place */}
				{/* <Row padding={{ right: 'extrasmall' }}>
					<IconButton size="medium" icon="DiagonalArrowLeftDownOutline" onClick={closeAction} />
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton size="medium" icon="ExpandOutline" onClick={closeAction} />
				</Row> */}
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton size="medium" icon="CloseOutline" onClick={closeAction} />
				</Row>
			</Row>
			<Divider />
			{eventIsEditable && (
				<Row
					mainAlignment="flex-end"
					crossAlignment="center"
					orientation="horizontal"
					background="gray5"
					width="fill"
					height="48px"
					padding={{ vertical: 'small' }}
				>
					<Row>
						<ActionButtons actions={actions} closeAction={closeAction} />
					</Row>
				</Row>
			)}
		</>
	);
};
