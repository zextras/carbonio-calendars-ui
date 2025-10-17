/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

interface MessageDesc {
	_content?: string;
}

interface MessageComp {
	desc?: MessageDesc[];
	descHtml?: MessageDesc[];
}

interface MessageInv {
	comp?: MessageComp[];
}

export interface MessageData {
	inv?: MessageInv[];
}
