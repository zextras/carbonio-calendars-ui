/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { format } from 'date-fns';

import defaultSettings from '@test-utils/settings/default-settings';

type DateLocalizerArg = {
	parse: (value: string, formatStr: string) => Date | null;
	format: (value: Date, formatStr: string) => string;
};

const flushPromises = (): Promise<void> =>
	new Promise<void>((resolve) => {
		setTimeout(resolve);
	});

vi.mock('react-widgets/lib/configure', () => ({
	default: { setDateLocalizer: vi.fn() }
}));

beforeEach(() => {
	vi.resetModules();
});

describe('dateFnsLocalizer', () => {
	it('calls configure.setDateLocalizer exactly once even when invoked multiple times', async () => {
		const configure = (await import('react-widgets/lib/configure')).default;
		const { dateFnsLocalizer } = await import('../date-fns-react-widgets-localizer');
		dateFnsLocalizer();
		dateFnsLocalizer();
		expect(configure.setDateLocalizer).toHaveBeenCalledOnce();
	});

	describe('parse', () => {
		it('returns null for an empty string', async () => {
			const configure = (await import('react-widgets/lib/configure')).default;
			const { dateFnsLocalizer } = await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			const { parse: localizerParse } = vi.mocked(configure.setDateLocalizer).mock
				.calls[0][0] as DateLocalizerArg;
			expect(localizerParse('', 'P')).toBeNull();
		});

		it('returns null for an invalid date string', async () => {
			const configure = (await import('react-widgets/lib/configure')).default;
			const { dateFnsLocalizer } = await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			const { parse: localizerParse } = vi.mocked(configure.setDateLocalizer).mock
				.calls[0][0] as DateLocalizerArg;
			expect(localizerParse('not a date', 'P')).toBeNull();
		});

		it('returns a valid Date for a correctly formatted date string', async () => {
			const configure = (await import('react-widgets/lib/configure')).default;
			const { dateFnsLocalizer } = await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			const { parse: localizerParse } = vi.mocked(configure.setDateLocalizer).mock
				.calls[0][0] as DateLocalizerArg;
			const result = localizerParse('2026-04-14', 'yyyy-MM-dd');
			expect(result).toBeInstanceOf(Date);
			const date = result as Date;
			expect(date.getFullYear()).toBe(2026);
			expect(date.getMonth()).toBe(3); // April = index 3
			expect(date.getDate()).toBe(14);
		});
	});

	describe('format', () => {
		it('formats a date with the year token', async () => {
			const configure = (await import('react-widgets/lib/configure')).default;
			const { dateFnsLocalizer } = await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			const { format: localizerFormat } = vi.mocked(configure.setDateLocalizer).mock
				.calls[0][0] as DateLocalizerArg;
			expect(localizerFormat(new Date(2026, 3, 14), 'yyyy')).toBe('2026');
		});

		it('formats a date with the day-of-month token', async () => {
			const configure = (await import('react-widgets/lib/configure')).default;
			const { dateFnsLocalizer } = await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			const { format: localizerFormat } = vi.mocked(configure.setDateLocalizer).mock
				.calls[0][0] as DateLocalizerArg;
			expect(localizerFormat(new Date(2026, 3, 14), 'dd')).toBe('14');
		});
	});

	describe('getDateFnsLocale', () => {
		it('returns the enUS locale by default before any locale loads', async () => {
			const { getDateFnsLocale } = await import('../date-fns-react-widgets-localizer');
			expect(getDateFnsLocale().code).toBe('en-US');
		});

		it('loads and returns the Italian locale when zimbraPrefLocale is "it"', async () => {
			const shellMock = await import('@zextras/carbonio-shell-ui');
			vi.mocked(shellMock.getUserSettings).mockReturnValue({
				...defaultSettings,
				prefs: { ...defaultSettings.prefs, zimbraPrefLocale: 'it' }
			});
			const { dateFnsLocalizer, getDateFnsLocale } =
				await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			await flushPromises();
			expect(format(new Date(2026, 3, 1), 'MMMM', { locale: getDateFnsLocale() })).toBe('aprile');
		});

		it('loads and returns the English locale when zimbraPrefLocale is "en"', async () => {
			const shellMock = await import('@zextras/carbonio-shell-ui');
			vi.mocked(shellMock.getUserSettings).mockReturnValue({
				...defaultSettings,
				prefs: { ...defaultSettings.prefs, zimbraPrefLocale: 'en' }
			});
			const { dateFnsLocalizer, getDateFnsLocale } =
				await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			await flushPromises();
			expect(format(new Date(2026, 3, 1), 'MMMM', { locale: getDateFnsLocale() })).toBe('April');
		});
	});

	describe('locale normalization', () => {
		it.each([
			{ input: 'it-IT', expectedCode: 'it' },
			{ input: 'zh-CN', expectedCode: 'zh-CN' },
			{ input: 'en-US', expectedCode: 'en-US' }
		])('normalizes "$input" to locale code "$expectedCode"', async ({ input, expectedCode }) => {
			const shellMock = await import('@zextras/carbonio-shell-ui');
			vi.mocked(shellMock.getUserSettings).mockReturnValue({
				...defaultSettings,
				prefs: { ...defaultSettings.prefs, zimbraPrefLocale: input }
			});
			const { dateFnsLocalizer, getDateFnsLocale } =
				await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			await flushPromises();
			expect(getDateFnsLocale().code).toBe(expectedCode);
		});

		it('falls back to enUS for the unsupported locale "ky"', async () => {
			const shellMock = await import('@zextras/carbonio-shell-ui');
			vi.mocked(shellMock.getUserSettings).mockReturnValue({
				...defaultSettings,
				prefs: { ...defaultSettings.prefs, zimbraPrefLocale: 'ky' }
			});
			const { dateFnsLocalizer, getDateFnsLocale } =
				await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			await flushPromises();
			expect(getDateFnsLocale().code).toBe('en-US');
		});
	});

	describe('navigator.language fallback', () => {
		it('uses navigator.language when zimbraPrefLocale is undefined', async () => {
			const originalLanguage = navigator.language;
			Object.defineProperty(navigator, 'language', { value: 'it-IT', configurable: true });

			const shellMock = await import('@zextras/carbonio-shell-ui');
			vi.mocked(shellMock.getUserSettings).mockReturnValue({
				...defaultSettings,
				prefs: { ...defaultSettings.prefs, zimbraPrefLocale: undefined }
			});
			const { dateFnsLocalizer, getDateFnsLocale } =
				await import('../date-fns-react-widgets-localizer');
			dateFnsLocalizer();
			await flushPromises();
			expect(getDateFnsLocale().code).toBe('it');

			Object.defineProperty(navigator, 'language', {
				value: originalLanguage,
				configurable: true
			});
		});
	});
});
