/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useEffect, useRef } from 'react';

import {
	Divider,
	Icon,
	IconButton,
	Row,
	Text,
	useHiddenCount
} from '@zextras/carbonio-design-system';
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';

const ActionButtons = ({ actions }: { actions: any[] }): JSX.Element => {
	const actionContainerRef = useRef(null);
	const [, recalculateHiddenActions] = useHiddenCount(actionContainerRef, true);

	useEffect(() => {
		recalculateHiddenActions();
	}, [actions, recalculateHiddenActions]);

	return (
		<Row wrap="nowrap" height="100%" mainAlignment="flex-end" style={{ maxWidth: '10rem' }}>
			<Row
				//	ref={actionContainerRef}
				height="2.5rem"
				mainAlignment="flex-start"
				style={{ overflow: 'hidden' }}
			>
				{actions &&
					map(actions, (action) => (
						<IconButton key={action.id} icon={action.icon} onClick={action.onClick} />
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

const ExpandButton = ({ actions }: { actions: any[] }): ReactElement => (
	<Row height="2.5rem" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
		{actions &&
			map(actions, (action) => (
				<IconButton key={action.id} icon={action.icon} onClick={action.onClick} />
			))}
	</Row>
);

type HeaderProps = {
	title: string;
	actions: any[];
	closeAction: () => void;
};

export const Header = ({ title, actions, closeAction }: HeaderProps): ReactElement => {
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
				height="3rem"
			>
				<Row padding={{ horizontal: 'large' }}>
					<Icon icon={'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{title ?? t('label.no_subject', 'No subject')}
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
					crossAlignment="flex-start"
					orientation="horizontal"
					background="gray5"
					width="fill"
					height="3rem"
					padding={{ vertical: 'small', right: 'large' }}
				>
					<Row>
						<ActionButtons actions={actions} />
					</Row>
				</Row>
			)}
		</>
	);
};
