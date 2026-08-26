/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactNode } from 'react';

import styled from '@emotion/styled';
import { Container, Tooltip } from '@zextras/carbonio-design-system';

const selectedRing = (color: string, theme: { palette: { gray6: { regular: string } } }): string =>
	`0 0 0 0.125rem ${theme.palette.gray6.regular}, 0 0 0 0.25rem ${color}`;

const HOVER_SHADOW = '0 0.125rem 0.375rem rgba(0, 0, 0, 0.25)';

/** A single round color swatch button. Shared by any color picker built on top of `ColorDotsRow`. */
export const ColorDot = styled.button<{ $color: string; $selected: boolean }>`
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 50%;
	border: none;
	background: ${({ $color }): string => $color};
	cursor: pointer;
	padding: 0;
	box-shadow: ${({ $selected, $color, theme }): string =>
		$selected ? selectedRing($color, theme) : 'none'};

	&:hover {
		box-shadow: ${({ $selected, $color, theme }): string =>
			$selected ? `${selectedRing($color, theme)}, ${HOVER_SHADOW}` : HOVER_SHADOW};
	}

	&:disabled {
		cursor: default;
		opacity: 0.5;

		&:hover {
			box-shadow: ${({ $selected, $color, theme }): string =>
				$selected ? selectedRing($color, theme) : 'none'};
		}
	}
`;

export type ColorDotOption = {
	hex: string;
	/** Accessible label / tooltip text — pass it already translated. */
	label: string;
};

/** Index of the option whose hex exactly (case-insensitively) matches `hex`, if any. */
export const findExactColorIndex = (
	colors: ColorDotOption[],
	hex: string | undefined
): number | undefined => {
	if (!hex) {
		return undefined;
	}
	const index = colors.findIndex((option) => option.hex.toLowerCase() === hex.toLowerCase());
	return index === -1 ? undefined : index;
};

export type ColorDotsRowProps = {
	colors: ColorDotOption[];
	/** Current color, as hex. */
	value: string;
	onChange: (hex: string) => void;
	disabled?: boolean;
	/** Extra content appended after the standard dots, e.g. a custom-color trigger/preview. */
	children?: ReactNode;
};

/**
 * A row of standard color swatches, generic over whatever palette is passed in — different
 * domains (calendars, tags, ...) use different hex sets for their "same" 10 colors, so the
 * palette is always supplied by the caller rather than hardcoded here.
 */
export const ColorDotsRow: FC<ColorDotsRowProps> = ({
	colors,
	value,
	onChange,
	disabled,
	children
}) => {
	const selectedIndex = findExactColorIndex(colors, value);

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="center"
			orientation="horizontal"
			height="fit"
			gap="1rem"
			wrap="wrap"
			padding={{ horizontal: '0.25rem' }}
		>
			{colors.map((color, index) => (
				<Tooltip key={color.label} label={color.label}>
					<ColorDot
						type="button"
						aria-label={color.label}
						aria-pressed={selectedIndex === index}
						$color={color.hex}
						$selected={selectedIndex === index}
						onClick={(): void => onChange(color.hex)}
						disabled={disabled}
					/>
				</Tooltip>
			))}
			{children}
		</Container>
	);
};
