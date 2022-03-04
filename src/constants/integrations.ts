/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// TEAMS/CHATS
export const ROOM_VALIDATOR_START = '<virtualRoom';
export const ROOM_VALIDATOR_END = 'virtualRoom>';

export const LINK_VALIDATOR_START = '<virtualLink';
export const LINK_VALIDATOR_END = 'virtualLink>';

export const roomValidationRegEx = new RegExp(`${ROOM_VALIDATOR_START}(.*)${ROOM_VALIDATOR_END}`);

export const linkValidationRegEx = new RegExp(`${LINK_VALIDATOR_START}(.*)${LINK_VALIDATOR_END}`);
