/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import getAppointment from './appointment';
import board from './board';
import calendars from './calendar';
import editor from './editor';
import getEvent from './event';
import getInvite from './invite';
import store from './store';
import utils from './utils';

const mockedData = {
	getEvent,
	getInvite,
	getAppointment,
	editor,
	calendars,
	utils,
	store,
	getBoard: board
};

export default mockedData;
