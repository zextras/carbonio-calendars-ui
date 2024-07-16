/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, isNil, map, omitBy, reduce } from 'lodash';
import moment from 'moment';

import { Appointment, ExceptionReference, InstanceReference } from '../types/store/appointments';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const normalizeApptInstanceRef = (instRef: any): ExceptionReference => ({
	alarm: instRef.alarm,
	allDay: instRef.allDay,
	draft: instRef.draft,
	inviteId: instRef.invId,
	isOrg: instRef.isOrg,
	dur: instRef.dur,
	loc: instRef?.loc,
	name: instRef.name,
	ptst: instRef.ptst,
	neverSent: instRef.neverSent,
	or: instRef.or,
	otherAtt: instRef.otherAtt,
	ex: instRef.ex,
	fr: instRef.fr,
	recur: instRef.recur,
	ridZ: instRef.ridZ,
	s: instRef.s,
	tzo: instRef.tzo
});

const normalizeApptInstancesRefs = (
	instRefs: Array<InstanceReference>,
	recur = false
): Array<InstanceReference> =>
	map(instRefs ?? [], (instRef) =>
		Object?.keys(instRef)?.length > 2
			? normalizeApptInstanceRef(instRef as ExceptionReference)
			: { ...instRef, recur }
	);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeAppointment = (appt: any): Appointment => ({
	id: appt.id,
	alarm: appt.alarm,
	alarmData: appt.alarmData,
	hasEx: appt?.hasEx,
	fb: appt.fb,
	fr: appt.fr ?? '',
	d: appt.d,
	fba: appt.fba,
	md: appt.md,
	flags: appt.f ?? '',
	ms: appt.ms,
	ptst: appt.ptst,
	rev: appt.rev,
	status: appt.status,
	transp: appt.transp,
	uid: appt.uid,
	compNum: appt.compNum,
	class: appt.class,
	dur: appt.dur,
	allDay: appt.allDay,
	inst: normalizeApptInstancesRefs(appt.inst, appt.recur),
	draft: appt.draft,
	inviteId: appt.invId,
	isOrg: appt.isOrg,
	loc: appt.loc,
	otherAtt: appt.otherAtt,
	recur: appt.recur ?? false,
	l: appt.l,
	name: appt.name,
	neverSent: appt.neverSent,
	or: appt.or,
	s: appt.s,
	tags: !isNil(appt.t) ? filter(appt.t.split(','), (t) => t !== '') : []
});

export const normalizeAppointments = (
	appts: Array<Appointment>
): Record<string, Appointment> | undefined =>
	appts
		? reduce(appts, (acc, appt) => ({ ...acc, [appt.id]: normalizeAppointment(appt) }), {})
		: undefined;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeAppointmentFromCreation = (appt: any, editor: any, id?: string): any => ({
	id: id ?? appt.inv[0].id,
	alarmData: appt.inv[0].comp[0].alarmData,
	fb: appt.inv[0].comp[0].fb,
	fr: appt.inv[0].comp[0].fr ?? '',
	d: appt.inv[0].comp[0].d,
	fba: appt.inv[0].comp[0].fba,
	md: appt.md,
	flags: appt.f ?? '',
	ms: appt.ms,
	ptst: appt.ptst,
	dur: editor.end - editor.start,
	rev: appt.rev,
	status: appt.inv[0].comp[0].status,
	transp: appt.inv[0].comp[0].transp,
	uid: appt.inv[0].comp[0].uid,
	compNum: appt.inv[0].comp[0].compNum,
	class: appt.inv[0].comp[0].class,
	allDay: editor.allDay,
	inst: [
		{
			recur: appt.recur ?? false,
			ridZ: moment(editor.start).format('YYYYMMDD[T]HHmmss[Z]'),
			s: editor.start
		}
	],
	alarm: appt.inv[0].comp[0].alarm,
	draft: editor.resource?.draft || false,
	inviteId: appt.id,
	isOrg: appt.inv[0].comp[0].isOrg,
	loc: appt.inv[0].comp[0].loc,
	otherAtt: appt.inv[0].comp[0].otherAtt ?? false,
	recur: appt.recur ?? false,
	l: appt.l,
	name: appt.inv[0].comp[0].name,
	neverSent: editor.resource?.neverSent || false,
	or: appt.inv[0].comp[0].or,
	s: appt.inv[0].comp[0].s
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeAppointmentFromNotify = (appt: any): Appointment => <Appointment>omitBy(
		{
			id: appt?.id,
			alarm: appt?.inv?.[0]?.comp?.[0]?.alarm,
			alarmData: appt?.inv?.[0]?.comp?.[0]?.alarmData,
			fb: appt?.inv?.[0]?.comp?.[0]?.fb,
			fr: appt?.inv?.[0]?.comp?.[0]?.fr,
			d: appt?.d,
			fba: appt?.inv?.[0]?.comp?.[0]?.fba,
			md: appt.md,
			flags: appt?.inv?.[0]?.comp?.[0]?.f,
			ms: appt?.inv?.[0]?.comp?.[0]?.ms,
			ptst: appt?.ptst,
			rev: appt.rev,
			status: appt?.inv?.[0]?.comp?.[0]?.status,
			transp: appt?.inv?.[0]?.comp?.[0]?.transp,
			uid: appt.uid,
			compNum: appt?.inv?.[0]?.compNum,
			class: appt?.inv?.[0]?.comp?.[0]?.class,
			dur:
				appt?.inv?.[0]?.comp?.[0]?.e?.[0]?.u && appt?.inv?.[0]?.comp?.[0]?.s?.[0]?.u
					? appt.inv[0].comp[0].e[0].u - appt.inv[0].comp[0].s[0].u
					: undefined,
			allDay: appt?.inv?.[0]?.comp?.[0]?.allDay,
			inst:
				appt?.id && appt?.inv?.[0]?.comp?.[0] && appt?.inv?.length === 1
					? [
							{
								recur: false,
								ridZ: appt?.inv?.[0]?.comp?.[0]?.s?.[0]?.d,
								s: appt?.inv?.[0]?.comp?.[0]?.s?.[0]?.u,
								title: appt?.inv?.[0]?.comp?.[0]?.name
							}
						]
					: undefined,
			draft: appt?.inv?.[0]?.comp?.[0]?.draft,
			inviteId: appt?.id && appt?.inv?.[0] ? `${appt.id}-${appt.inv[0].id}` : undefined,
			isOrg: appt?.inv?.[0]?.comp?.[0]?.isOrg,
			loc: appt?.inv?.[0]?.comp?.[0]?.loc,
			otherAtt: appt?.inv?.[0]?.comp?.[0]?.otherAtt,
			recur: appt?.inv?.[0]?.comp?.[0]?.recur,
			l: appt.l,
			name: appt?.inv?.[0]?.comp?.[0]?.name,
			meta: appt?.meta,
			neverSent: appt?.inv?.[0]?.comp?.[0]?.neverSent,
			or: appt?.inv?.[0]?.comp?.[0]?.or,
			s: appt.s
		},
		isNil
	);

export const normalizeAppointmentsFromNotify = (
	appts: Array<Appointment>
): Record<string, Appointment> | undefined =>
	appts
		? reduce(
				appts,
				(acc, appt) => ({ ...acc, [appt.id]: normalizeAppointmentFromNotify(appt) }),
				{}
			)
		: undefined;
