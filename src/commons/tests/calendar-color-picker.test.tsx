/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';

import { CalendarColorPicker, CalendarColorPickerProps } from '../calendar-color-picker';
import { screen, setupTest } from '@test-setup';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';

const STANDARD_COLOR = CALENDARS_STANDARD_COLORS[1]; // blue
const ANOTHER_STANDARD_COLOR = CALENDARS_STANDARD_COLORS[3]; // green
const CUSTOM_HEX = '#123456';
const CUSTOM_COLOR_LABEL = 'Custom color (hex code)';
const HEX_INPUT_LABEL = 'Hex color';
const ARIA_PRESSED = 'aria-pressed';

// The i18n test instance has no translation resources, so a lookup without a fallback default
// (as used for the standard color dot labels) resolves to the raw key itself.
const standardColorLabel = (label: string): string => `colors.${label}`;

const getStandardDot = (label: string | undefined): HTMLElement =>
	screen.getByRole('button', { name: standardColorLabel(label ?? '') });

const getCustomizeTrigger = (): HTMLElement =>
	screen.getByRoleWithIcon('button', { icon: 'icon: PlusCircleOutline' });

const getHexInput = (): HTMLElement => screen.getByRole('textbox', { name: HEX_INPUT_LABEL });

describe('CalendarColorPicker', () => {
	test('renders the standard color dots and calls onChange with the clicked hex', async () => {
		const onChange = vi.fn();
		const { user } = setupTest(
			<CalendarColorPicker value={STANDARD_COLOR.color} onChange={onChange} />
		);

		const dot = getStandardDot(ANOTHER_STANDARD_COLOR.label);
		expect(dot).toHaveAttribute(ARIA_PRESSED, 'false');

		await user.click(dot);

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith(ANOTHER_STANDARD_COLOR.color);
	});

	test('marks the dot matching the current value as selected', () => {
		setupTest(<CalendarColorPicker value={STANDARD_COLOR.color} onChange={vi.fn()} />);

		expect(getStandardDot(STANDARD_COLOR.label)).toHaveAttribute(ARIA_PRESSED, 'true');
	});

	test('does not render a custom-color dot when the current value is a standard color', () => {
		setupTest(<CalendarColorPicker value={STANDARD_COLOR.color} onChange={vi.fn()} />);

		expect(screen.queryByRole('button', { name: CUSTOM_COLOR_LABEL })).not.toBeInTheDocument();
	});

	test('shows a selected custom-color dot when the current value is not a standard color', () => {
		setupTest(<CalendarColorPicker value={CUSTOM_HEX} onChange={vi.fn()} />);

		const customDot = screen.getByRole('button', { name: CUSTOM_COLOR_LABEL });
		expect(customDot).toBeVisible();
		expect(customDot).toHaveAttribute(ARIA_PRESSED, 'true');
	});

	test('resets the hex input to the current value each time the popover reopens', async () => {
		const onChange = vi.fn();
		const { user } = setupTest(
			<CalendarColorPicker value={STANDARD_COLOR.color} onChange={onChange} />
		);

		await user.click(getCustomizeTrigger());
		expect(getHexInput()).toHaveValue(STANDARD_COLOR.color);

		await user.clear(getHexInput());
		await user.type(getHexInput(), '#abcdef');
		expect(getHexInput()).toHaveValue('#abcdef');

		await user.click(screen.getByText('Cancel'));
		expect(onChange).not.toHaveBeenCalled();

		await user.click(getCustomizeTrigger());
		expect(getHexInput()).toHaveValue(STANDARD_COLOR.color);
	});

	test('typing a valid hex updates the draft, an invalid one is ignored on save', async () => {
		const onChange = vi.fn();
		const { user } = setupTest(
			<CalendarColorPicker value={STANDARD_COLOR.color} onChange={onChange} />
		);

		await user.click(getCustomizeTrigger());

		await user.clear(getHexInput());
		await user.type(getHexInput(), '#ff0000');
		expect(getHexInput()).toHaveValue('#ff0000');

		await user.clear(getHexInput());
		await user.type(getHexInput(), 'zzz');
		// The input still reflects whatever was typed, even though it's not a valid hex.
		expect(getHexInput()).toHaveValue('zzz');

		await user.click(screen.getByText('Save'));

		// The invalid text never became the draft color, so the last valid one is saved instead.
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith('#ff0000');
	});

	test('saving closes the popover and calls onChange with the draft color', async () => {
		const onChange = vi.fn();
		const { user } = setupTest(
			<CalendarColorPicker value={STANDARD_COLOR.color} onChange={onChange} />
		);

		await user.click(getCustomizeTrigger());
		await user.clear(getHexInput());
		await user.type(getHexInput(), '#abcdef');

		await user.click(screen.getByText('Save'));

		expect(onChange).toHaveBeenCalledWith('#abcdef');
		expect(screen.queryByRole('textbox', { name: HEX_INPUT_LABEL })).not.toBeInTheDocument();
	});

	test('cancelling closes the popover without calling onChange', async () => {
		const onChange = vi.fn();
		const { user } = setupTest(
			<CalendarColorPicker value={STANDARD_COLOR.color} onChange={onChange} />
		);

		await user.click(getCustomizeTrigger());
		await user.click(screen.getByText('Cancel'));

		expect(onChange).not.toHaveBeenCalled();
		expect(screen.queryByRole('textbox', { name: HEX_INPUT_LABEL })).not.toBeInTheDocument();
	});

	test('notifies onOpenChange when the popover opens and closes', async () => {
		const onOpenChange = vi.fn();
		const { user } = setupTest(
			<CalendarColorPicker
				value={STANDARD_COLOR.color}
				onChange={vi.fn()}
				onOpenChange={onOpenChange}
			/>
		);

		await user.click(getCustomizeTrigger());
		expect(onOpenChange).toHaveBeenLastCalledWith(true);

		await user.click(screen.getByText('Cancel'));
		expect(onOpenChange).toHaveBeenLastCalledWith(false);
	});

	test('disables the standard dots and the trigger when disabled', () => {
		setupTest(<CalendarColorPicker value={STANDARD_COLOR.color} onChange={vi.fn()} disabled />);

		expect(getStandardDot(STANDARD_COLOR.label)).toBeDisabled();
		expect(getCustomizeTrigger()).toBeDisabled();
	});

	test('re-selects the last picked custom color after switching to a standard color', async () => {
		const ControlledPicker: FC<Omit<CalendarColorPickerProps, 'value' | 'onChange'>> = (props) => {
			const [value, setValue] = useState<string>(STANDARD_COLOR.color);
			return <CalendarColorPicker {...props} value={value} onChange={setValue} />;
		};

		const { user } = setupTest(<ControlledPicker />);

		// Pick a custom color via the popover, so `lastCustomHex` gets set.
		await user.click(getCustomizeTrigger());
		await user.clear(getHexInput());
		await user.type(getHexInput(), CUSTOM_HEX);
		await user.click(screen.getByText('Save'));

		const customDot = screen.getByRole('button', { name: CUSTOM_COLOR_LABEL });
		expect(customDot).toHaveAttribute(ARIA_PRESSED, 'true');

		// Switch to a standard color: the custom dot stays visible, but becomes unselected.
		await user.click(getStandardDot(ANOTHER_STANDARD_COLOR.label));
		expect(customDot).toHaveAttribute(ARIA_PRESSED, 'false');

		// Clicking the custom dot again re-applies the original custom color.
		await user.click(customDot);
		expect(customDot).toHaveAttribute(ARIA_PRESSED, 'true');
	});
});
