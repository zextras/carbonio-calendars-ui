/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { createFakeIdentity } from '../../../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import { IdentityItem } from '../../../types/editor';

const getRandomInRange = ({ min = 1, max = 3 }: { min?: number; max?: number } = {}): number =>
	faker.number.int({ max, min });

const getRandomCalendarFlags = (): string => {
	const flags = ['', '#', '~', 'o', 'y', 'i', '*', 'b'];
	const index = getRandomInRange({ min: 0, max: flags.length - 1 });
	return flags[index];
};

const getRandomEditorId = (isNew = true): string => {
	const randomId = getRandomInRange({ max: 5 });
	return isNew ? `new-${randomId}` : `edit-${randomId}`;
};

const getRandomOrganizer = (org?: IdentityItem): IdentityItem => {
	const defaultIdentity = createFakeIdentity();

	return {
		address: defaultIdentity.email,
		fullName: defaultIdentity.fullName,
		identityName: 'DEFAULT',
		label: `DEFAULT ${defaultIdentity.fullName} (${defaultIdentity.email})`,
		type: undefined,
		value: '0',
		...(org ?? {})
	};
};

const getSingleEditorFields = (context: any = {}): any => ({
	isException: false,
	isSeries: false,
	isInstance: true,
	exceptId: undefined,
	recur: undefined,
	...context
});

const getExceptionEditorFields = (context: any = {}): any => ({
	isException: true,
	isSeries: false,
	isInstance: true,
	exceptId: undefined,
	recur: undefined,
	...context
});

const getSeriesEditorFields = (context: any = {}): any => ({
	isException: false,
	isSeries: true,
	isInstance: false,
	exceptId: undefined,
	recur: [
		{
			add: [
				{
					rule: [
						{
							freq: 'DAI',
							until: [
								{
									d: '20241210T083000Z'
								}
							],
							interval: [
								{
									ival: 1
								}
							]
						}
					]
				}
			]
		}
	],
	...context
});

const getInstanceEditorFields = (context: any = {}): any => ({
	isException: false,
	isSeries: true,
	isInstance: true,
	exceptId: undefined,
	recur: [
		{
			add: [
				{
					rule: [
						{
							freq: 'DAI',
							until: [
								{
									d: '20241210T083000Z'
								}
							],
							interval: [
								{
									ival: 1
								}
							]
						}
					]
				}
			]
		}
	],
	...context
});

const getSingleEventFields = (context: any = {}): any => ({
	isException: false,
	isRecurrent: false,
	ridZ: '20220101T093000Z',
	...context
});

const getExceptionEventFields = (context: any = {}): any => ({
	isException: true,
	isRecurrent: false,
	ridZ: '20220101T093000Z',
	...context
});

const getSeriesEventFields = (context: any = {}): any => ({
	isException: false,
	isRecurrent: true,
	ridZ: undefined,
	...context
});

const getInstanceEventFields = (context: any = {}): any => ({
	isException: false,
	isRecurrent: true,
	ridZ: '20221215T083000Z',
	...context
});

export default {
	getRandomInRange,
	getRandomCalendarFlags,
	getRandomEditorId,
	getRandomOrganizer,
	getSingleEditorFields,
	getExceptionEditorFields,
	getSeriesEditorFields,
	getInstanceEditorFields,
	getSingleEventFields,
	getExceptionEventFields,
	getSeriesEventFields,
	getInstanceEventFields
};
