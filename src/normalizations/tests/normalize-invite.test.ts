/* eslint-disable sonarjs/no-duplicate-string */
// noinspection HtmlRequiredLangAttribute

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { normalizeInvite, normalizeInviteFromSync } from 'normalizations/normalize-invite';

describe('normalize-invite.ts', () => {
	describe('normalizeInvite', () => {
		it('should extract HTML description from invite component when available', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [],
				inv: [
					{
						comp: [
							{
								descHtml: '<html><body>HTML from component</body></html>',
								desc: 'Text from component',
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([
				{ _content: '<html><body>HTML from component</body></html>' }
			]);
			expect(result.textDescription).toEqual([{ _content: 'Text from component' }]);
		});

		it('should extract HTML description from message parts when not in invite component', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [
					{
						contentType: 'multipart/mixed',
						parts: [
							{
								contentType: 'text/html',
								content: '<html><body>HTML from parts</body></html>'
							},
							{
								contentType: 'text/calendar',
								content: 'BEGIN:VCALENDAR...'
							}
						]
					}
				],
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([
				{ _content: '<html><body>HTML from parts</body></html>' }
			]);
		});

		it('should extract both HTML and text descriptions from nested message parts', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [
					{
						contentType: 'multipart/mixed',
						parts: [
							{
								contentType: 'text/html',
								content: '<html><body>HTML content</body></html>'
							},
							{
								contentType: 'text/plain',
								content: 'Plain text content'
							}
						]
					}
				],
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([
				{ _content: '<html><body>HTML content</body></html>' }
			]);
			expect(result.textDescription).toEqual([{ _content: 'Plain text content' }]);
		});

		it('should prefer invite component descriptions over message parts', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [
					{
						contentType: 'text/html',
						content: '<html><body>HTML from parts</body></html>'
					}
				],
				inv: [
					{
						comp: [
							{
								descHtml: '<html><body>HTML from component</body></html>',
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([
				{ _content: '<html><body>HTML from component</body></html>' }
			]);
		});

		it('should return empty arrays when no descriptions are available', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [],
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([]);
			expect(result.textDescription).toEqual([]);
		});

		it('should handle message without mp property (no mail parts)', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [],
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
				// mp property is intentionally missing
			};

			const result = normalizeInvite(mockMessage);

			expect(result.parts).toEqual([]);
			expect(result.attach).toBeDefined();
			expect(result.attachmentFiles).toEqual([]);
		});

		it('should handle message with mp property containing attachments', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [],
				mp: [
					{
						part: '1',
						ct: 'application/pdf',
						filename: 'document.pdf',
						s: 12345
					}
				],
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.parts).toBeDefined();
			expect(result.attach).toBeDefined();
			expect(result.attachmentFiles).toBeDefined();
		});

		it('should handle parts array with undefined items gracefully', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [
					undefined,
					null,
					{
						contentType: 'text/html',
						content: '<html><body>HTML content</body></html>'
					}
				] as never,
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([
				{ _content: '<html><body>HTML content</body></html>' }
			]);
		});

		it('should handle deeply nested parts structure with null values', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [
					{
						contentType: 'multipart/mixed',
						parts: [
							null,
							{
								contentType: 'multipart/alternative',
								parts: [
									undefined,
									{
										contentType: 'text/plain',
										content: 'Plain text content'
									},
									{
										contentType: 'text/html',
										content: '<html><body>HTML content</body></html>'
									}
								] as never
							}
						] as never
					}
				],
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([
				{ _content: '<html><body>HTML content</body></html>' }
			]);
			expect(result.textDescription).toEqual([{ _content: 'Plain text content' }]);
		});

		it('should handle parts without contentType property', () => {
			const mockMessage = {
				id: '2687',
				l: '2380',
				f: '',
				d: 1752046088000,
				tn: '',
				parts: [
					{
						parts: [
							{
								contentType: 'text/html',
								content: '<html><body>HTML content</body></html>'
							}
						]
					}
				] as never,
				inv: [
					{
						comp: [
							{
								name: 'Test Appointment',
								apptId: '2688',
								ciFolder: '10',
								s: [{ d: '20250710T073000Z', u: 1752132600000 }],
								e: [{ u: 1752134400000, d: '20250710T080000Z' }]
							}
						]
					}
				]
			};

			const result = normalizeInvite(mockMessage);

			expect(result.htmlDescription).toEqual([
				{ _content: '<html><body>HTML content</body></html>' }
			]);
		});
	});

	describe('normalizeInviteFromSync', () => {
		it('should normalize basic sync invite data correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				d: 1752046088000,
				f: 'u',
				comp: [
					{
						name: 'Team Meeting',
						apptId: '5678',
						ciFolder: '10',
						compNum: 0,
						loc: 'Conference Room A',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						desc: 'Quarterly review meeting',
						descHtml: '<html><body>Quarterly review meeting</body></html>',
						fr: 'Quarterly review...',
						allDay: 0,
						isOrg: 1,
						rsvp: 1
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.id).toBe('5678-1234');
			expect(result.apptId).toBe('5678');
			expect(result.ciFolder).toBe('10');
			expect(result.compNum).toBe(0);
			expect(result.name).toBe('Team Meeting');
			expect(result.location).toBe('Conference Room A');
			expect(result.allDay).toBe(false);
			expect(result.date).toBe(1752046088000);
			expect(result.isOrganizer).toBe(true); // isOrg: 1 converts to true
			expect(result.fragment).toBe('Quarterly review...');
		});

		it('should generate correct composite ID from apptId and invite id', () => {
			const mockSyncInvite = {
				id: '9999',
				comp: [
					{
						apptId: '1111',
						ciFolder: '10',
						name: 'Test Event',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.id).toBe('1111-9999');
		});

		it('should use ciFolder as parent for sync data', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '15',
						name: 'Test Event',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.parent).toBe('15');
			expect(result.ciFolder).toBe('15');
		});

		it('should normalize attendees correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Meeting with Attendees',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						at: [
							{
								a: 'john@example.com',
								d: 'John Doe',
								ptst: 'AC',
								rsvp: 1,
								role: 'REQ-PARTICIPANT'
							},
							{
								a: 'jane@example.com',
								d: 'Jane Smith',
								ptst: 'TE',
								rsvp: 1,
								role: 'OPT-PARTICIPANT'
							}
						]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.attendees).toHaveLength(2);
			expect(result.attendees[0].a).toBe('john@example.com');
			expect(result.attendees[1].a).toBe('jane@example.com');
		});

		it('should normalize organizer information', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Organized Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						or: {
							a: 'organizer@example.com',
							d: 'Meeting Organizer',
							sentBy: 'assistant@example.com'
						},
						isOrg: 0
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.organizer).toBeDefined();
			expect(result.organizer.a).toBe('organizer@example.com');
			expect(result.organizer.d).toBe('Meeting Organizer');
			expect(result.isOrganizer).toBe(false);
		});

		it('should handle alarm data correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Meeting with Alarm',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						alarm: [
							{
								action: 'DISPLAY',
								trigger: [
									{
										rel: [
											{
												m: 15,
												related: 'START',
												neg: 1
											}
										]
									}
								]
							}
						]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.alarm).toBe(true);
			expect(result.alarmData).toBeDefined();
			expect(result.alarmData).toHaveLength(1);
		});

		it('should normalize status and class fields', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Confirmed Private Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						status: 'CONF',
						class: 'PRI'
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.status).toBe('CONF');
			expect(result.class).toBe('PRI');
		});

		it('should normalize free/busy status correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Busy Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						fb: 'B',
						fba: 'B',
						transp: 'O'
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.freeBusy).toBe('B');
			expect(result.freeBusyActualStatus).toBe('B');
			expect(result.transparency).toBe('O');
		});

		it('should use default free/busy status when not provided', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.freeBusy).toBe('B');
			expect(result.freeBusyActualStatus).toBe('B');
		});

		it('should handle recurrence and exception data', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Recurring Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						ex: 1,
						exceptId: {
							d: '20250710',
							tz: 'America/New_York'
						},
						recur: {
							add: {
								rule: {
									freq: 'WEE',
									interval: { ival: 1 }
								}
							}
						}
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.isException).toBe(true); // ex: 1 converts to true
			expect(result.exceptId).toBeDefined();
			expect(result.recurrenceRule).toBeDefined();
		});

		it('should normalize tags correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				t: 'tag1,tag2,tag3',
				tn: 'Tag1,Tag2,Tag3',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Tagged Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
			expect(result.tagNamesList).toBe('Tag1,Tag2,Tag3');
		});

		it('should handle empty or missing tags', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Untagged Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.tags).toEqual([]);
			expect(result.tagNamesList).toBeUndefined();
		});

		it('should normalize timezone information', () => {
			const mockSyncInvite = {
				id: '1234',
				tz: [
					{
						id: 'America/New_York',
						stdoff: -300,
						dayoff: -240
					},
					{
						id: 'UTC',
						stdoff: 0
					}
				],
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Timezone Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.tz).toBe('America/New_York');
		});

		it('should handle attachments correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				mp: [
					{
						part: '1',
						ct: 'application/pdf',
						filename: 'document.pdf',
						s: 12345
					}
				],
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Meeting with Attachments',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.parts).toBeDefined();
			expect(result.attach).toBeDefined();
			expect(result.attachmentFiles).toBeDefined();
		});

		it('should handle metadata fields correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				f: 'u',
				ms: 5000,
				rev: 3,
				meta: [
					{ section: 'zwc:implicit', _attrs: { a: 'zimbraPrefCalendarDefaultApptVisibility' } }
				],
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Meeting with Metadata',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }],
						seq: 2,
						uid: 'unique-id-12345',
						url: 'https://example.com/meeting',
						noBlob: 0,
						neverSent: 1,
						xprop: [{ name: 'X-CUSTOM-PROP', value: 'custom-value' }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.flags).toBe('u');
			expect(result.ms).toBe(5000);
			expect(result.rev).toBe(3);
			expect(result.meta).toBeDefined();
			expect(result.sequenceNumber).toBe(2);
			expect(result.uid).toBe('unique-id-12345');
			expect(result.url).toBe('https://example.com/meeting');
			expect(result.noBlob).toBe(0);
			expect(result.neverSent).toBe(true); // neverSent: 1 converts to true
			expect(result.xprop).toBeDefined();
		});

		it('should handle minimal sync data with defaults', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Minimal Meeting',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.id).toBe('5678-1234');
			expect(result.name).toBe('Minimal Meeting');
			expect(result.allDay).toBe(false);
			expect(result.isOrganizer).toBe(false);
			expect(result.isException).toBe(false);
			expect(result.alarm).toBe(false);
			expect(result.attendees).toEqual([]);
			expect(result.tags).toEqual([]);
			expect(result.location).toBe('');
			expect(result.ms).toBe(0);
			expect(result.rev).toBe(0);
		});

		it('should normalize location URL correctly', () => {
			const mockSyncInvite = {
				id: '1234',
				comp: [
					{
						apptId: '5678',
						ciFolder: '10',
						name: 'Meeting at Foo',
						loc: 'https://meet.foo.com/abc-defg-hij',
						s: [{ d: '20250710T090000Z', u: 1752138000000 }],
						e: [{ d: '20250710T100000Z', u: 1752141600000 }]
					}
				]
			};

			const result = normalizeInviteFromSync(mockSyncInvite);

			expect(result.location).toBe('https://meet.foo.com/abc-defg-hij');
			expect(result.locationUrl).toBeDefined();
		});
	});
});
