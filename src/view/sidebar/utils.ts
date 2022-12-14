/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const capitalise = (word: string): string => {
	const asciiRef = word?.charCodeAt(0);
	const newAsciiRef = asciiRef - 32;
	const newChar = String.fromCharCode(newAsciiRef);
	return word ? newChar + word.substring(1) : '';
};
