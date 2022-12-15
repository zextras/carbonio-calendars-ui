/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import getEvent from './event';
import getInvite from './invite';
import editor from './editor';
import calendars from './calendar';
import utils from './utils';
import store from './store';

const mockedData = {
	getEvent,
	getInvite,
	editor,
	calendars,
	utils,
	store
};

export default mockedData;
