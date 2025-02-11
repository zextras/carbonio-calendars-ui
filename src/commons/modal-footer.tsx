/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useMemo } from 'react';

import { Button, Container, Divider, Padding, Tooltip } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { ModalFooterProps } from '../carbonio-ui-commons/types';

const ModalFooter: FC<ModalFooterProps> = ({
	mainAlignment = 'center',
	crossAlignment = 'center',
	onConfirm,
	color = 'primary',
	label,
	secondaryAction,
	secondaryLabel = t('label.cancel', 'cancel'),
	primaryBtnType = 'default',
	secondaryBtnType = 'default',
	disabled,
	secondaryDisabled,
	background = 'primary',
	secondarybackground,
	secondaryColor = 'secondary',
	showDivider = true,
	tooltip,
	additionalAction,
	additionalBtnType = 'outlined',
	additionalColor = 'secondary',
	additionalLabel = t('label.cancel', 'cancel')
}): ReactElement => {
	const secondaryButtonTypeAndColor = useMemo(() => {
		if (secondaryBtnType === 'ghost') {
			return { type: secondaryBtnType, color: secondaryColor };
		}
		if (secondaryBtnType === 'default') {
			return {
				type: secondaryBtnType,
				backgroundColor: secondaryColor || secondarybackground
			};
		}
		return {
			type: secondaryBtnType,
			labelColor: secondaryColor,
			backgroundColor: secondarybackground
		};
	}, [secondaryBtnType, secondaryColor, secondarybackground]);

	const primaryButtonTypeAndColor = useMemo(() => {
		if (primaryBtnType === 'ghost') {
			return { type: primaryBtnType, color };
		}
		if (primaryBtnType === 'default') {
			return { type: primaryBtnType, backgroundColor: color || background };
		}
		return { type: primaryBtnType, labelColor: color, backgroundColor: background };
	}, [background, color, primaryBtnType]);

	return (
		<Container mainAlignment={mainAlignment} crossAlignment={crossAlignment}>
			{showDivider && (
				<Container
					padding={{ top: 'small', bottom: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					orientation="horizontal"
					height="fit"
				>
					<Divider />
				</Container>
			)}
			<Container orientation="horizontal" mainAlignment="space-between">
				{additionalAction && (
					<Container orientation="horizontal" width="fit">
						<Button
							color={additionalColor}
							type={additionalBtnType}
							onClick={additionalAction}
							label={additionalLabel}
							width="fit"
						/>
						<Padding horizontal="extrasmall" />
					</Container>
				)}
				<Container
					padding={{ top: 'small', bottom: 'small' }}
					mainAlignment="flex-end"
					crossAlignment="flex-start"
					orientation="horizontal"
					height="fit"
				>
					{secondaryAction && (
						<>
							<Button
								{...secondaryButtonTypeAndColor}
								onClick={secondaryAction}
								label={secondaryLabel}
								disabled={secondaryDisabled}
								width="fit"
							/>
							<Padding horizontal="extrasmall" />
						</>
					)}
					{tooltip ? (
						<Tooltip label={tooltip} placement="top" maxWidth="fit">
							<Button
								width="fit"
								onClick={onConfirm}
								label={label}
								disabled={disabled}
								{...primaryButtonTypeAndColor}
							/>
						</Tooltip>
					) : (
						<Button
							width="fit"
							onClick={onConfirm}
							label={label}
							disabled={disabled}
							{...primaryButtonTypeAndColor}
						/>
					)}
				</Container>
			</Container>
		</Container>
	);
};
export default ModalFooter;
