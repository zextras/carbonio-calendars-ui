/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import {
	Button,
	Container,
	Icon,
	Input,
	Popover,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { HexColorPicker } from 'react-colorful';
import { useTranslation } from 'react-i18next';

import { ColorDot, ColorDotsRow, findExactColorIndex } from './color-dots-row';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { useCloseOnEscape } from 'hooks/use-close-on-escape';
import { useOnOutsideClick } from 'hooks/use-on-outside-click';
import { usePreventBackdropClose } from 'hooks/use-prevent-backdrop-close';

const CALENDAR_COLOR_OPTIONS = CALENDARS_STANDARD_COLORS.map((color) => ({
	hex: color.color,
	label: color.label
}));

const CustomColorTriggerButton = styled.button`
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 50%;
	border: none;
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;

	&:disabled {
		cursor: default;
		opacity: 0.5;
	}
`;

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Resolves a folder's color into a single hex string: an `rgb` custom color takes precedence,
 * otherwise the standard color at `color` index, defaulting to the first standard color.
 */
export const resolveCalendarColorHex = (
	color: number | undefined,
	rgb: string | undefined
): string =>
	rgb ?? CALENDARS_STANDARD_COLORS[color ?? 0]?.color ?? CALENDARS_STANDARD_COLORS[0].color;

export type CalendarColorPickerProps = {
	/** Current color, as hex. Use `resolveCalendarColorHex` to derive it from a folder. */
	value: string;
	onChange: (hex: string) => void;
	/** Notified whenever the custom-color popover opens/closes, e.g. to disable sibling controls. */
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
};

export const CalendarColorPicker: FC<CalendarColorPickerProps> = ({
	value,
	onChange,
	onOpenChange,
	disabled = false
}) => {
	const [t] = useTranslation();

	const colors = useMemo(
		() =>
			CALENDAR_COLOR_OPTIONS.map((option) => ({ ...option, label: t(`colors.${option.label}`) })),
		[t]
	);

	const isCustomColorSelected = findExactColorIndex(colors, value) === undefined;

	// Persists across re-selecting a standard color, so a previously-picked custom color keeps
	// showing its own (deselected) dot instead of disappearing — the user can click it to go back
	// to it. It only tracks the *current mount*'s custom pick, resetting naturally on remount
	// (i.e. next time the modal opens), which mirrors the original per-session behavior.
	const [lastCustomHex, setLastCustomHex] = useState<string | undefined>(
		isCustomColorSelected ? value : undefined
	);

	const colorSwatchRef = useRef<HTMLButtonElement>(null);
	const popoverContentRef = useRef<HTMLDivElement>(null);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [draftHex, setDraftHex] = useState(value);
	const [hexInputValue, setHexInputValue] = useState(value);

	usePreventBackdropClose(isPopoverOpen, popoverContentRef);

	useEffect(() => {
		onOpenChange?.(isPopoverOpen);
	}, [isPopoverOpen, onOpenChange]);

	useEffect(() => {
		if (isCustomColorSelected) {
			setLastCustomHex(value);
		}
	}, [isCustomColorSelected, value]);

	useEffect(() => {
		if (isPopoverOpen) {
			setDraftHex(value);
			setHexInputValue(value);
		}
	}, [isPopoverOpen, value]);

	const onDraftColorChange = useCallback((hex: string) => {
		setDraftHex(hex);
		setHexInputValue(hex);
	}, []);

	const onHexInputChange = useCallback((inputValue: string) => {
		setHexInputValue(inputValue);
		if (HEX_COLOR_REGEX.test(inputValue)) {
			setDraftHex(inputValue);
		}
	}, []);

	const onSaveCustomColor = useCallback(() => {
		onChange(draftHex);
		setIsPopoverOpen(false);
	}, [draftHex, onChange]);

	const onCancelCustomColor = useCallback(() => {
		setIsPopoverOpen(false);
	}, []);

	useCloseOnEscape(isPopoverOpen, onCancelCustomColor);
	useOnOutsideClick(isPopoverOpen, popoverContentRef, colorSwatchRef, onCancelCustomColor);

	const onToggleTrigger = useCallback(() => {
		setIsPopoverOpen((prev) => !prev);
	}, []);

	const onSelectExistingCustomColor = useCallback(() => {
		if (lastCustomHex) {
			onChange(lastCustomHex);
		}
	}, [lastCustomHex, onChange]);

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			orientation="vertical"
			height="fit"
			gap="0.5rem"
		>
			<ColorDotsRow
				colors={colors}
				value={value}
				onChange={onChange}
				disabled={disabled || isPopoverOpen}
			>
				{lastCustomHex && (
					<Tooltip
						label={t('label.custom_color', 'Custom color ({{hex}})', { hex: lastCustomHex })}
					>
						<ColorDot
							type="button"
							aria-label={t('label.custom_color', 'Custom color ({{hex}})', {
								hex: lastCustomHex
							})}
							aria-pressed={isCustomColorSelected}
							$color={lastCustomHex}
							$selected={isCustomColorSelected}
							onClick={onSelectExistingCustomColor}
							disabled={disabled || isPopoverOpen}
						/>
					</Tooltip>
				)}
				<Tooltip label={t('label.customize_color', 'Customize color')} triggerRef={colorSwatchRef}>
					<CustomColorTriggerButton type="button" onClick={onToggleTrigger} disabled={disabled}>
						<Icon icon="PlusCircleOutline" size="large" color="primary" />
					</CustomColorTriggerButton>
				</Tooltip>
				<Popover
					disablePortal
					anchorEl={colorSwatchRef}
					open={isPopoverOpen}
					onClose={onCancelCustomColor}
					placement="bottom-start"
					style={{ zIndex: 1001 }}
				>
					<Container
						ref={popoverContentRef}
						padding="0.75rem"
						gap="0.75rem"
						width="fit"
						height="fit"
					>
						<HexColorPicker color={draftHex} onChange={onDraftColorChange} />
						<Input
							label={t('label.hex_color', 'Hex color')}
							value={hexInputValue}
							onChange={(e): void => onHexInputChange(e.target.value)}
						/>
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							height="fit"
							width="fill"
							gap="0.5rem"
						>
							<Button
								type="outlined"
								color="secondary"
								label={t('label.cancel', 'Cancel')}
								onClick={onCancelCustomColor}
							/>
							<Button color="primary" label={t('label.save', 'Save')} onClick={onSaveCustomColor} />
						</Container>
					</Container>
				</Popover>
			</ColorDotsRow>
			<Text size="small" color="secondary">
				{t(
					'label.choose_color_caption',
					'Choose a color to make this calendar easier to recognize'
				)}
			</Text>
		</Container>
	);
};
