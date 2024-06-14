/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import { isEqual, transform, isObject, find } from 'lodash';

export const ShowReminderOptions = () => [
	{ label: t('reminder.never', 'Never'), value: '0' },
	{ label: t('reminder.all_time', 'All time of the event'), value: '-1' },
	{
		label: t('reminder.minute_before', {
			count: 1,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: '1'
	},
	{
		label: t('reminder.minute_before', {
			count: 5,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: '5'
	},
	{
		label: t('reminder.minute_before', {
			count: 10,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: '10'
	},
	{
		label: t('reminder.minute_before', {
			count: 15,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: '15'
	},
	{
		label: t('reminder.minute_before', {
			count: 30,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: '30'
	},
	{
		label: t('reminder.minute_before', {
			count: 45,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: '45'
	},
	{
		label: t('reminder.hour_before', {
			count: 1,
			defaultValue_one: '{{count}} hour before',
			defaultValue_other: '{{count}} hours before'
		}),
		value: '60'
	},
	{
		label: t('reminder.hour_before', {
			count: 2,
			defaultValue_one: '{{count}} hour before',
			defaultValue_other: '{{count}} hours before'
		}),
		value: '120'
	},
	{
		label: t('reminder.hour_before', {
			count: 4,
			defaultValue_one: '{{count}} hour before',
			defaultValue_other: '{{count}} hours before'
		}),
		value: '240'
	},
	{
		label: t('reminder.hour_before', {
			count: 5,
			defaultValue_one: '{{count}} hour before',
			defaultValue_other: '{{count}} hours before'
		}),
		value: '300'
	},
	{
		label: t('reminder.hour_before', {
			count: 18,
			defaultValue_one: '{{count}} hour before',
			defaultValue_other: '{{count}} hours before'
		}),
		value: '1080'
	},
	{
		label: t('reminder.day_before', {
			count: 1,
			defaultValue_one: '{{count}} day before',
			defaultValue_other: '{{count}} days before'
		}),
		value: '1440'
	},
	{
		label: t('reminder.day_before', {
			count: 2,
			defaultValue_one: '{{count}} day before',
			defaultValue_other: '{{count}} days before'
		}),
		value: '2880'
	},
	{
		label: t('reminder.day_before', {
			count: 3,
			defaultValue_one: '{{count}} day before',
			defaultValue_other: '{{count}} days before'
		}),
		value: '4320'
	},
	{
		label: t('reminder.day_before', {
			count: 4,
			defaultValue_one: '{{count}} day before',
			defaultValue_other: '{{count}} days before'
		}),
		value: '5760'
	},
	{
		label: t('reminder.week_before', {
			count: 1,
			defaultValue_one: '{{count}} week before',
			defaultValue_other: '{{count}} weeks before'
		}),
		value: '10080'
	},
	{
		label: t('reminder.week_before', {
			count: 2,
			defaultValue_one: '{{count}} week before',
			defaultValue_other: '{{count}} weeks before'
		}),
		value: '20160'
	}
];

export const DefaultViewOptions = () => [
	{ label: t('settings.options.default_view.month', 'Month View'), value: 'month' },
	{ label: t('settings.options.default_view.week', 'Week View'), value: 'week' },
	{ label: t('settings.options.default_view.day', 'Day View'), value: 'day' },
	{ label: t('settings.options.default_view.work_week', 'Work Week View'), value: 'workWeek' },
	{ label: t('settings.options.default_view.list', 'List View'), value: 'list' }
];
export const DefaultCalendarOptions = () => [
	{ label: t('label.calendar', 'Calendar'), value: 'calendar' }
];

export const TimeZonesOptions = () => [
	{
		value: 'Etc/GMT+12',
		label: t('timezone.dateline', { value: 'GMT -12:00', defaultValue: '{{value}} Dateline' })
	},
	{
		value: 'Pacific/Midway',
		label: t('timezone.samoa', { value: 'GMT -11:00', defaultValue: '{{value}} Samoa' })
	},
	{
		value: 'Etc/GMT+11',
		label: t('timezone.gmt_11', { value: 'GMT -11:00', defaultValue: '{{value}} GMT-11' })
	},
	{
		value: 'Pacific/Honolulu',
		label: t('timezone.hawaii', { value: 'GMT -10:00', defaultValue: '{{value}} Hawaii' })
	},
	{
		value: 'America/Anchorage',
		label: t('timezone.alaska', { value: 'GMT -09:00', defaultValue: '{{value}} Alaska' })
	},
	{
		value: 'America/Los_Angeles',
		label: t('timezone.us_canada_pacific', {
			value: 'GMT -08:00',
			defaultValue: '{{value}} US/Canada Pacific'
		})
	},
	{
		value: 'America/Tijuana',
		label: t('timezone.baja_california', {
			value: 'GMT -08:00',
			defaultValue: '{{value}} Baja California'
		})
	},
	{
		value: 'America/Denver',
		label: t('timezone.us_canada_mountain', {
			value: 'GMT -07:00',
			defaultValue: '{{value}} US/Canada Mountain'
		})
	},
	{
		value: 'America/Chihuahua',
		label: t('timezone.chihuahua_la_paz_mazatlan', {
			value: 'GMT -07:00',
			defaultValue: '{{value}} Chihuahua, La Paz, Mazatlan'
		})
	},
	{
		value: 'America/Phoenix',
		label: t('timezone.arizona', { value: 'GMT -07:00', defaultValue: '{{value}} Arizona' })
	},
	{
		value: 'America/Chicago',
		label: t('timezone.us_canada_central', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} US/Canada Central'
		})
	},
	{
		value: 'America/Regina',
		label: t('timezone.saskatchewan', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} Saskatchewan'
		})
	},
	{
		value: 'America/Mexico_City',
		label: t('timezone.guadalajara_mexico_city_monterrey ', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} Guadalajara, Mexico City, Monterrey '
		})
	},
	{
		value: 'America/Guatemala',
		label: t('timezone.central_america', {
			value: 'GMT -06:00',
			defaultValue: '{{value}} Central America'
		})
	},
	{
		value: 'America/New_York',
		label: t('timezone.us_canada_eastern', {
			value: 'GMT -05:00',
			defaultValue: '{{value}} US/Canada Eastern'
		})
	},
	{
		value: 'America/Indiana/Indianapolis',
		label: t('timezone.indiana_east', {
			value: 'GMT -05:00',
			defaultValue: '{{value}} Indiana (East)'
		})
	},
	{
		value: 'America/Bogota',
		label: t('timezone.colombia', { value: 'GMT -05:00', defaultValue: '{{value}} Colombia' })
	},
	{
		value: 'America/Caracas',
		label: t('timezone.caracas', { value: 'GMT -04:30', defaultValue: '{{value}} Caracas' })
	},
	{
		value: 'America/Santiago',
		label: t('timezone.pacific_south_america', {
			value: 'GMT -04:00',
			defaultValue: '{{value}} Pacific South America'
		})
	},
	{
		value: 'America/Manaus',
		label: t('timezone.manaus', { value: 'GMT -04:00', defaultValue: '{{value}} Manaus' })
	},
	{
		value: 'America/La_Paz',
		label: t('timezone.la_paz', { value: 'GMT -04:00', defaultValue: '{{value}} La Paz' })
	},
	{
		value: 'America/Guyana',
		label: t('timezone.georgetown_la_paz_manaus_san_juan', {
			value: 'GMT -04:00',
			defaultValue: '{{value}} Georgetown, La Paz, Manaus, San Juan'
		})
	},
	{
		value: 'America/Cuiaba',
		label: t('timezone.cuiaba', { value: 'GMT -04:00', defaultValue: '{{value}} Cuiaba' })
	},
	{
		value: 'America/Halifax',
		label: t('timezone.atlantic_time_canada', {
			value: 'GMT -04:00',
			defaultValue: '{{value}} Atlantic Time (Canada)'
		})
	},
	{
		value: 'America/Asuncion',
		label: t('timezone.asuncion', { value: 'GMT -04:00', defaultValue: '{{value}} Asuncion' })
	},
	{
		value: 'America/St_Johns',
		label: t('timezone.newfoundland', {
			value: 'GMT -03:30',
			defaultValue: '{{value}} Newfoundland'
		})
	},
	{
		value: 'America/Montevideo',
		label: t('timezone.montevideo', { value: 'GMT -03:00', defaultValue: '{{value}} Montevideo' })
	},
	{
		value: 'America/Godthab',
		label: t('timezone.greenland', { value: 'GMT -03:00', defaultValue: '{{value}} Greenland' })
	},
	{
		value: 'America/Cayenne',
		label: t('timezone.cayenne_fortaleza', {
			value: 'GMT -03:00',
			defaultValue: '{{value}} Cayenne, Fortaleza'
		})
	},
	{
		value: 'America/Sao_Paulo',
		label: t('timezone.brasilia', { value: 'GMT -03:00', defaultValue: '{{value}} Brasilia' })
	},
	{
		value: 'America/Argentina/Buenos_Aires',
		label: t('timezone.argentina', { value: 'GMT -03:00', defaultValue: '{{value}} Argentina' })
	},
	{
		value: 'Atlantic/South_Georgia',
		label: t('timezone.mid_atlantic', {
			value: 'GMT -02:00',
			defaultValue: '{{value}} Mid-Atlantic'
		})
	},
	{
		value: 'Etc/GMT+2',
		label: t('timezone.gmt_02', { value: 'GMT -02:00', defaultValue: '{{value}} GMT-02' })
	},
	{
		value: 'Atlantic/Cape_Verde',
		label: t('timezone.cape_verde_is', {
			value: 'GMT -01:00',
			defaultValue: '{{value}} Cape Verde Is.'
		})
	},
	{
		value: 'Atlantic/Azores',
		label: t('timezone.azores', { value: 'GMT -01:00', defaultValue: '{{value}} Azores' })
	},
	{
		value: 'UTC',
		label: t('timezone.coordinated_universal_time', {
			value: 'GMT/UTC',
			defaultValue: '{{value}} Coordinated Universal Time'
		})
	},
	{
		value: 'Europe/London',
		label: t('timezone.britain_ireland_portugal', {
			value: 'GMT +00:00',
			defaultValue: '{{value}} Britain, Ireland, Portugal'
		})
	},
	{
		value: 'Africa/Casablanca',
		label: t('timezone.casablanca', { value: 'GMT +00:00', defaultValue: '{{value}} Casablanca' })
	},
	{
		value: 'Africa/Monrovia',
		label: t('timezone.monrovia', { value: 'GMT +00:00', defaultValue: '{{value}} Monrovia' })
	},
	{
		value: 'Europe/Berlin',
		label: t('timezone.amsterdam_berlin_bern_rome_stockholm_vienna', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna'
		})
	},
	{
		value: 'Europe/Belgrade',
		label: t('timezone.belgrade_bratislava_budapest_ljubljana_prague', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Belgrade, Bratislava, Budapest, Ljubljana, Prague'
		})
	},
	{
		value: 'Europe/Brussels',
		label: t('timezone.brussels_copenhagen_madrid_paris ', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Brussels, Copenhagen, Madrid, Paris '
		})
	},
	{
		value: 'Africa/Windhoek',
		label: t('timezone.namibia', { value: 'GMT +01:00', defaultValue: '{{value}} Namibia' })
	},
	{
		value: 'Europe/Warsaw',
		label: t('timezone.sarajevo_skopje_warsaw_zagreb', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} Sarajevo, Skopje, Warsaw, Zagreb'
		})
	},
	{
		value: 'Africa/Algiers',
		label: t('timezone.west_central_africa', {
			value: 'GMT +01:00',
			defaultValue: '{{value}} West Central Africa'
		})
	},
	{
		value: 'Europe/Athens',
		label: t('timezone.athens_beirut_bucharest_istanbul', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Athens, Beirut, Bucharest, Istanbul'
		})
	},
	{
		value: 'Asia/Beirut',
		label: t('timezone.beirut', { value: 'GMT +02:00', defaultValue: '{{value}} Beirut' })
	},
	{
		value: 'Asia/Damascus',
		label: t('timezone.damascus', { value: 'GMT +02:00', defaultValue: '{{value}} Damascus' })
	},
	{
		value: 'Africa/Cairo',
		label: t('timezone.egypt', { value: 'GMT +02:00', defaultValue: '{{value}} Egypt' })
	},
	{
		value: 'Africa/Harare',
		label: t('timezone.harare_pretoria', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Harare, Pretoria'
		})
	},
	{
		value: 'Europe/Helsinki',
		label: t('timezone.helsinki_kyiv_riga_sofia_tallinn_vilnius', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius'
		})
	},
	{
		value: 'Europe/Istanbul',
		label: t('timezone.istanbul', { value: 'GMT +02:00', defaultValue: '{{value}} Istanbul' })
	},
	{
		value: 'Asia/Jerusalem',
		label: t('timezone.jerusalem', { value: 'GMT +02:00', defaultValue: '{{value}} Jerusalem' })
	},
	{
		value: 'Asia/Amman',
		label: t('timezone.jordan', { value: 'GMT +02:00', defaultValue: '{{value}} Jordan' })
	},
	{
		value: 'Europe/Kaliningrad',
		label: t('timezone.kaliningrad_rtz_1', {
			value: 'GMT +02:00',
			defaultValue: '{{value}} Kaliningrad (RTZ 1)'
		})
	},
	{
		value: 'Asia/Baghdad',
		label: t('timezone.iraq', { value: 'GMT +03:00', defaultValue: '{{value}} Iraq' })
	},
	{
		value: 'Asia/Kuwait',
		label: t('timezone.kuwait_riyadh', {
			value: 'GMT +03:00',
			defaultValue: '{{value}} Kuwait, Riyadh'
		})
	},
	{
		value: 'Europe/Minsk',
		label: t('timezone.minsk', { value: 'GMT +03:00', defaultValue: '{{value}} Minsk' })
	},
	{
		value: 'Europe/Moscow',
		label: t('timezone.moscow_st_petersburg_volgograd_rtz_2', {
			value: 'GMT +03:00',
			defaultValue: '{{value}} Moscow, St. Petersburg, Volgograd (RTZ 2)'
		})
	},
	{
		value: 'Africa/Nairobi',
		label: t('timezone.nairobi', { value: 'GMT +03:00', defaultValue: '{{value}} Nairobi' })
	},
	{
		value: 'Asia/Tehran',
		label: t('timezone.tehran', { value: 'GMT +03:30', defaultValue: '{{value}} Tehran' })
	},
	{
		value: 'Asia/Muscat',
		label: t('timezone.abu_dhabi_muscat', {
			value: 'GMT +04:00',
			defaultValue: '{{value}} Abu Dhabi, Muscat'
		})
	},
	{
		value: 'Asia/Baku',
		label: t('timezone.baku', { value: 'GMT +04:00', defaultValue: '{{value}} Baku' })
	},
	{
		value: 'Indian/Mauritius',
		label: t('timezone.port_louis', { value: 'GMT +04:00', defaultValue: '{{value}} Port Louis' })
	},
	{
		value: 'Asia/Tbilisi',
		label: t('timezone.tbilisi', { value: 'GMT +04:00', defaultValue: '{{value}} Tbilisi' })
	},
	{
		value: 'Asia/Yerevan',
		label: t('timezone.yerevan', { value: 'GMT +04:00', defaultValue: '{{value}} Yerevan' })
	},
	{
		value: 'Asia/Kabul',
		label: t('timezone.kabul', { value: 'GMT +04:30', defaultValue: '{{value}} Kabul' })
	},
	{
		value: 'Asia/Yekaterinburg',
		label: t('timezone.ekaterinburg_rtz_4', {
			value: 'GMT +05:00',
			defaultValue: '{{value}} Ekaterinburg (RTZ 4)'
		})
	},
	{
		value: 'Asia/Colombo',
		label: t('timezone.sri_jayawardenepura_kotte', {
			value: 'GMT +05:30',
			defaultValue: '{{value}} Sri Jayawardenepura Kotte'
		})
	},
	{
		value: 'Asia/Kolkata',
		label: t('timezone.chennai_kolkata_mumbai_new_delhi', {
			value: 'GMT +05:30',
			defaultValue: '{{value}} Chennai, Kolkata, Mumbai, New Delhi'
		})
	},
	{
		value: 'Asia/Kathmandu',
		label: t('timezone.kathmandu', { value: 'GMT +05:45', defaultValue: '{{value}} Kathmandu' })
	},
	{
		value: 'Asia/Dhaka',
		label: t('timezone.dhaka', { value: 'GMT +06:00', defaultValue: '{{value}} Dhaka' })
	},
	{
		value: 'Asia/Yangon',
		label: t('timezone.yangon', { value: 'GMT +06:30', defaultValue: '{{value}} Yangon' })
	},
	{
		value: 'Asia/Bangkok',
		label: t('timezone.bangkok_hanoi_jakarta', {
			value: 'GMT +07:00',
			defaultValue: '{{value}} Bangkok, Hanoi, Jakarta'
		})
	},
	{
		value: 'Asia/Krasnoyarsk',
		label: t('timezone.krasnoyarsk_rtz_6', {
			value: 'GMT +07:00',
			defaultValue: '{{value}} Krasnoyarsk (RTZ 6)'
		})
	},
	{
		value: 'Asia/Hong_Kong',
		label: t('timezone.beijing_chongqing_hong_kong_urumqi', {
			value: 'GMT +08:00',
			defaultValue: '{{value}} Beijing, Chongqing, Hong Kong, Urumqi'
		})
	},
	{
		value: 'Asia/Irkutsk',
		label: t('timezone.irkutsk_rtz_7', {
			value: 'GMT +08:00',
			defaultValue: '{{value}} Irkutsk (RTZ 7)'
		})
	},
	{
		value: 'Australia/Eucla',
		label: t('timezone.eucla', { value: 'GMT +08:45', defaultValue: '{{value}} Eucla' })
	},
	{
		value: 'Asia/Chita',
		label: t('timezone.chita', { value: 'GMT +09:00', defaultValue: '{{value}} Chita' })
	},
	{
		value: 'Asia/Pyongyang',
		label: t('timezone.pyongyang', { value: 'GMT +08:30', defaultValue: '{{value}} Pyongyang' })
	},
	{
		value: 'Asia/Seoul',
		label: t('timezone.korea', { value: 'GMT +09:00', defaultValue: '{{value}} Korea' })
	},
	{
		value: 'Australia/Darwin',
		label: t('timezone.darwin', { value: 'GMT +09:30', defaultValue: '{{value}} Darwin' })
	},
	{
		value: 'Asia/Vladivostok',
		label: t('timezone.vladivostok_magadan', {
			value: 'GMT +10:00',
			defaultValue: '{{value}} vladivostok_magadan_rtz_9'
		})
	},
	{
		value: 'Asia/Magadan',
		label: t('timezone.magadan', { value: 'GMT +11:00', defaultValue: '{{value}} Magadan' })
	},
	{
		value: 'Asia/Kamchatka',
		label: t('timezone.anadyr_petropavlovsk_kamchatsky_rtz11', {
			value: 'GMT +12:00',
			defaultValue: '{{value}} Anadyr, Petropavlovsk-Kamchatsky (RTZ 11)'
		})
	},
	{
		value: 'Pacific/Tongatapu',
		label: t('timezone.nuku_alofa', { value: 'GMT +13:00', defaultValue: '{{value}} Nuku’alofa' })
	},
	{
		value: 'Pacific/Kiritimati',
		label: t('timezone.christmas_island', {
			value: 'GMT +14:00',
			defaultValue: '{{value}} Christmas Island'
		})
	}
];
export const FreeBusyOptions = () => [
	{
		label: t(
			'settings.options.free_busy_opts.allow_all',
			'Allow both internal and external users to see my free/busy information'
		),
		value: 'pub'
	},
	{
		label: t(
			'settings.options.free_busy_opts.allow_internal',
			'Allow only users of internal domains to see my free/busy information'
		),
		value: 'all'
	},
	{
		label: t(
			'settings.options.free_busy_opts.allow_domain',
			'Allow only users of my domain to see my free/busy information'
		),
		value: 'zextras.com'
	},
	{
		label: t(
			'settings.options.free_busy_opts.allow_none',
			"Don't let anyone see my free/busy information"
		),
		value: 'y3'
	},
	{
		label: t(
			'settings.options.free_busy_opts.allow_following',
			'Allow only the following internal users to see my free/busy information'
		),
		value: 'y5'
	}
];

export const InvitesOptions = () => [
	{
		label: t(
			'settings.options.invt_opts.allow_all',
			'Allow both internal and extrernal users to invite me to meetings'
		),
		value: 'v1'
	},
	{
		label: t(
			'settings.options.invt_opts.allow_internal',
			'Allow only internal users to invite me to meetings'
		),
		value: 'v2'
	},
	{
		label: t('settings.options.invt_opts.allow_none', "Don't let anyone to invite me to meetings"),
		value: 'v3'
	},
	{
		label: t(
			'settings.options.invt_opts.allow_following',
			'Allow only the following internal users to invite me to meetings'
		),
		value: 'v4'
	}
];
export const StartWeekOfOptions = () => [
	{ label: t('label.week_day.sunday', 'Sunday'), value: '0' },
	{ label: t('label.week_day.monday', 'Monday'), value: '1' },
	{ label: t('label.week_day.tuesday', 'Tuesday'), value: '2' },
	{ label: t('label.week_day.wednesday', 'Wednesday'), value: '3' },
	{ label: t('label.week_day.thursday', 'Thursday'), value: '4' },
	{ label: t('label.week_day.friday', 'Friday'), value: '5' },
	{ label: t('label.week_day.saturday', 'Saturday'), value: '6' }
];

export const DefaultApptVisibiltyOptions = () => [
	{ label: t('settings.options.dflt_vsblty_opt.public', 'Public'), value: 'public' },
	{ label: t('label.private', 'Private'), value: 'private' }
];
export const SpanTimeOptions = (isMinutesFormat) => [
	{
		label: t('reminder.minute_before', {
			count: 30,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: isMinutesFormat ? '30m' : '1800'
	},
	{
		label: t('reminder.minute_before', {
			count: 60,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: isMinutesFormat ? '60m' : '3600'
	},
	{
		label: t('reminder.minute_before', {
			count: 90,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: isMinutesFormat ? '90m' : '5400'
	},
	{
		label: t('reminder.minute_before', {
			count: 120,
			defaultValue_one: '{{count}} minute before',
			defaultValue_other: '{{count}} minutes before'
		}),
		value: isMinutesFormat ? '120m' : '7200'
	}
];

export const getWeekDay = (day) => {
	switch (day) {
		case '1':
			return t('label.week_day.monday', 'Monday');
		case '2':
			return t('label.week_day.tuesday', 'Tuesday');
		case '3':
			return t('label.week_day.wednesday', 'Wednesday');
		case '4':
			return t('label.week_day.thursday', 'Thursday');
		case '5':
			return t('label.week_day.friday', 'Friday');
		case '6':
			return t('label.week_day.saturday', 'Saturday');
		default:
			return t('label.week_day.sunday', 'Sunday');
	}
};

export const ShareCalendarWithOptions = () => [
	{
		label: t('share.options.share_calendar_with.internal_users_groups', 'Internal Users or Groups'),
		value: 'usr'
	},
	{
		label: t(
			'share.options.share_calendar_with.public',
			'Public (view only, no password required)'
		),
		value: 'pub'
	}
];

export const ShareCalendarRoleOptions = (canViewPrvtAppt) => [
	{ label: t('share.options.share_calendar_role.none', 'None'), value: '' },
	{
		label: t('share.options.share_calendar_role.viewer', 'Viewer'),
		value: canViewPrvtAppt ? 'rp' : 'r'
	},
	{
		label: t('share.options.share_calendar_role.admin', 'Admin'),
		value: canViewPrvtAppt ? 'rwidxap' : 'rwidxa'
	},
	{
		label: t('share.options.share_calendar_role.manager', 'Manager'),
		value: canViewPrvtAppt ? 'rwidxp' : 'rwidx'
	}
];

export const differenceObject = (object, base) => {
	// eslint-disable-next-line no-shadow
	function changes(object, base) {
		return transform(object, (result, value, key) => {
			if (!isEqual(value, base[key])) {
				// eslint-disable-next-line no-param-reassign
				result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
};

export const validEmailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

export const validEmail = (email) => !!validEmailRegex.test(email);

export const findLabel = (list, value) => find(list, (item) => item.value === value)?.label;
