import { faker } from '@faker-js/faker';
import { createFakeIdentity } from '../../../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import { IdentityItem } from '../../../types/editor';

const getRandomInRange = ({ min = 1, max = 3 }: { min?: number; max?: number } = {}): number =>
	faker.datatype.number({ max, min });

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

export default { getRandomInRange, getRandomCalendarFlags, getRandomEditorId, getRandomOrganizer };
