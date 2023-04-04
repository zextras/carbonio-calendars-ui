/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	ContainerProps,
	Divider,
	Icon,
	IconButton,
	Padding,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { isNil, map } from 'lodash';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAppSelector } from '../../store/redux/hooks';
import { selectActiveEditorId, selectEditorTitle } from '../../store/selectors/editor';
import { EditorPanel } from './editor-panel';

const BackgroundContainer = styled.div`
	z-index: 10;
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.73);
	border-radius: 0;
`;

export const AppointmentCardContainer = styled(Container)<ContainerProps & { expanded?: boolean }>`
	z-index: 10;
	position: absolute;
	top: ${({ expanded }): string => (expanded ? '1rem' : '1rem')};
	right: ${({ expanded }): string => (expanded ? '1rem' : '1rem')};
	bottom: ${({ expanded }): string => (expanded ? '0' : '1rem')};
	left: ${({ expanded }): string => (expanded ? '1rem' : 'max(calc(100% - 42.5rem), 0.75rem)')};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	max-height: 100%;
	padding: 0;
`;

type HeaderProps = {
	editorId: string;
	expanded: boolean;
	setExpanded: (arg: (e: boolean) => boolean) => void;
};

const Header = ({ editorId, expanded, setExpanded }: HeaderProps): ReactElement | null => {
	const [t] = useTranslation();

	const title = useAppSelector(selectEditorTitle(editorId));

	const headerItems = useMemo(
		() => [
			{
				id: 'expand',
				icon: expanded ? 'Collapse' : 'Expand',
				label: '',
				onClick: (): void => setExpanded((e: boolean) => !e)
			},
			{
				id: 'close',
				icon: 'CloseOutline',
				label: '',
				onClick: (): void => {
					replaceHistory('');
				}
			}
		],
		[expanded, setExpanded]
	);

	return !isNil(title) ? (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray5"
				width="fill"
				height="3rem"
				padding={{ vertical: 'small' }}
				data-testid="EditorHeader"
			>
				<Row padding={{ horizontal: 'large' }}>
					<Icon icon={'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{title ?? t('label.no_subject', 'No subject')}
					</Text>
				</Row>
				<Row height="2.5rem" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
					{headerItems &&
						map(headerItems, (action) => (
							<IconButton
								key={action.id}
								icon={action.icon}
								onClick={action.onClick}
								data-testid={action.id}
							/>
						))}
					<Padding right="extrasmall" />
				</Row>
			</Row>
			<Divider />
		</>
	) : null;
};

const EditorPanelWrapper = (): ReactElement | null => {
	const editorId = useAppSelector(selectActiveEditorId);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		if (!editorId) {
			replaceHistory('');
		}
	}, [editorId]);

	return editorId ? (
		<>
			{expanded && <BackgroundContainer data-testid="EditorBackgroundContainer" />}
			<AppointmentCardContainer
				mainAlignment="flex-start"
				expanded={expanded}
				data-testid="AppointmentCardContainer"
			>
				<Header editorId={editorId} expanded={expanded} setExpanded={setExpanded} />
				<EditorPanel editorId={editorId} expanded={expanded} />
			</AppointmentCardContainer>
		</>
	) : null;
};

export default EditorPanelWrapper;
