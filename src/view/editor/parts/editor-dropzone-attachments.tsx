/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container, Icon, Text, Padding, ContainerProps } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const BackDropLayout = styled(Container)`
	width: 100%;
	position: absolute;
	height: 100%;
	z-index: 2;
	top: 0;
	left: 0;
`;

const DropBackground = styled(Container)`
	width: calc(100% - 0.625rem);
	background: ${(props): string => props.theme.palette.primary.regular}b9;
	height: calc(100% - 0.625rem);
	margin-top: 0.3125rem;
	left: 0.3125rem;
	pointer-events: none;
`;

const BackDropLayoutInnerBox = styled(Container)`
	background: ${(props): string => props.theme.palette.gray6.regular};
	border-radius: 0.625rem;
	min-height: 11.25rem;
	max-width: 23.75rem;
	max-height: 13.125rem;
`;

const BackDropLayoutContentBox = styled(Container)`
	border-style: dashed;
	border-width: 0.125rem;
	border-radius: 0.3125rem;
	border-color: ${(props): string => props.theme.palette.primary.regular};
	box-sizing: border-box;
	padding: 2.5rem;
`;

const DropBoxIconGroup = styled(Container)`
	margin-bottom: 0.5rem;
	height: 2.5rem;
`;

const DetailText = styled(Text)`
	text-align: center;
`;

type DropzoneProps = {
	onDragOver?: ContainerProps['onDragOver'];
	onDrop?: ContainerProps['onDrop'];
	onDragLeave?: ContainerProps['onDragLeave'];
};

export const DropZoneAttachment = ({
	onDragOver,
	onDrop,
	onDragLeave
}: DropzoneProps): ReactElement => {
	const [t] = useTranslation();
	return (
		<>
			<BackDropLayout
				onDragOver={onDragOver}
				onDrop={onDrop}
				onDragLeave={onDragLeave}
				borderRadius="half"
			>
				<DropBackground>
					<BackDropLayoutInnerBox>
						<Padding all="medium">
							<BackDropLayoutContentBox>
								<Container mainAlignment="center">
									<DropBoxIconGroup mainAlignment="center" orientation="horizontal">
										<Padding right="small" left="small">
											<Icon
												icon="ImageOutline"
												height="2.1875rem"
												width="2.1875rem"
												color="primary"
											/>
										</Padding>
										<Padding right="small" left="small">
											<Icon
												icon="FileAddOutline"
												height="2.1875rem"
												width="2.1875rem"
												color="primary"
											/>
										</Padding>
										<Padding right="small" left="small">
											<Icon
												icon="FilmOutline"
												height="2.1875rem"
												width="2.1875rem"
												color="primary"
											/>
										</Padding>
									</DropBoxIconGroup>
									<Container mainAlignment="center" height="auto">
										<Text color="primary" weight="bold">
											{t('composer.attachment.draganddrop.title', 'Drag&Drop Mode')}
										</Text>
										<Padding top="small" />
										<DetailText
											size="medium"
											weight="regular"
											color="primary"
											overflow="break-word"
										>
											{t(
												'composer.attachment.draganddrop.content',
												'Drop here your attachements to quickly add them to the appointment'
											)}
										</DetailText>
									</Container>
								</Container>
							</BackDropLayoutContentBox>
						</Padding>
					</BackDropLayoutInnerBox>
				</DropBackground>
			</BackDropLayout>
		</>
	);
};
