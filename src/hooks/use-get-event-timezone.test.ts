/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';

import { useGetEventTimezoneString } from './use-get-event-timezone';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';

describe('useGetEventTimezone', () => {
	const europeBerlinGMT = 'GMT +01:00 Europe/Berlin';
	test('When creation timezone is the same as local', () => {
		const { result } = setupHook(useGetEventTimezoneString, {
			initialProps: [
				moment().valueOf(),
				moment().add('30', 'minutes').valueOf(),
				false,
				moment.tz.guess()
			]
		});

		expect(result.current).toStrictEqual(expect.objectContaining({ showTimezoneTooltip: false }));
		expect(result.current.localTimeString).toStrictEqual(result.current.eventTimeString);
		expect(result.current.localTimezoneString).toStrictEqual(result.current.eventTimezoneString);
	});

	test('When creation timezone is different from local', () => {
		const { result } = setupHook(useGetEventTimezoneString, {
			initialProps: [1695146400000, 1695148200000, false, 'Asia/Bangkok']
		});

		expect(result.current).toStrictEqual(expect.objectContaining({ showTimezoneTooltip: true }));
		expect(result.current.localTimeString).toStrictEqual(
			'Tuesday, 19 September, 2023 21:00 - 21:30'
		);
		expect(result.current.localTimezoneString).toStrictEqual(europeBerlinGMT);
		expect(result.current.eventTimeString).toStrictEqual(
			'Wednesday, 20 September, 2023 02:00 - 02:30'
		);
		expect(result.current.eventTimezoneString).toStrictEqual('GMT +07:00 Asia/Bangkok');
	});

	test('When creation timezone is different from local and it is all day', () => {
		const { result } = setupHook(useGetEventTimezoneString, {
			initialProps: [1695146400000, 1695148200000, true, 'Asia/Bangkok']
		});

		expect(result.current).toStrictEqual(expect.objectContaining({ showTimezoneTooltip: true }));
		expect(result.current.localTimeString).toStrictEqual('Tuesday, 19 September, 2023 - All day');
		expect(result.current.localTimezoneString).toStrictEqual(europeBerlinGMT);
		expect(result.current.eventTimeString).toStrictEqual('Wednesday, 20 September, 2023 - All day');
		expect(result.current.eventTimezoneString).toStrictEqual(europeBerlinGMT);
	});
});
