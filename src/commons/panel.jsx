/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Container } from '@zextras/carbonio-design-system';
import { Header } from '../view/event-panel-view/header';

const AppointmentCardContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 68px;
	right: 12px;
	bottom: 12px;
	left: ${({ expanded }) => (expanded ? '12px' : 'max(calc(100% - 680px), 12px)')};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	overflow: hidden;
`;

const BackgroundContainer = styled.div`
	z-index: 10;
	position: absolute;
	top: 0px;
	right: 0px;
	bottom: 0px;
	left: 0px;
	background-color: rgba(0, 0, 0, 0.73);
	border-radius: 0px;
`;

const AppointmentExpandedContainer = styled(Container)`
	z-index: 10;
	position: absolute;
	top: 16px;
	right: 16px;
	left: 16px;
	bottom: 0px;
	width: auto;
	height: auto;
	overflow: hidden;
	max-height: 100%;
`;

export default function Panel({ children, title, actions, closeAction, resizable, hideActions }) {
	const [expanded, setExpanded] = useState(false);
	const actionsWithExpand = useMemo(
		() =>
			resizable
				? [
						{
							id: 'expand',
							icon: expanded ? 'Collapse' : 'Expand',
							label: '',
							click: () => setExpanded((e) => !e)
						},
						...(hideActions ? [] : actions)
				  ]
				: actions,
		[actions, expanded, resizable, hideActions]
	);

	const childrenWithExpandedContainer = React.Children.map(children, (child) => {
		// checking isValidElement is the safe way and avoids a typescript error too
		if (React.isValidElement(child)) {
			return React.cloneElement(child, { panelIsExpanded: expanded });
		}
		return child;
	});

	if (expanded)
		return (
			<>
				<BackgroundContainer>
					<AppointmentExpandedContainer
						background="gray5"
						mainAlignment="flex-start"
						expanded={expanded}
						height="100%"
					>
						<Header title={title} actions={actionsWithExpand} closeAction={closeAction} />
						{childrenWithExpandedContainer}
					</AppointmentExpandedContainer>
				</BackgroundContainer>
			</>
		);
	return (
		<AppointmentCardContainer background="gray5" mainAlignment="flex-start" expanded={expanded}>
			<Header title={title} actions={actionsWithExpand} closeAction={closeAction} />
			{childrenWithExpandedContainer}
		</AppointmentCardContainer>
	);
}
