import { faker } from '@faker-js/faker';

import { mockWindowLocation } from '@test-utils/utils/window';
import { getCarbonioDomain } from 'utils/domain';

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
describe('getCarbonioDomain', () => {
	it('should return the domain from current URL', () => {
		const domain = faker.internet.domainName();
		mockWindowLocation({
			hostname: domain,
			href: `https://${domain}/${faker.system.fileName()}`
		});
		expect(getCarbonioDomain()).toEqual(domain);
	});
});
