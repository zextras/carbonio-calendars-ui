/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com> * * SPDX-License-Identifier: AGPL-3.0-only */
import type { Config } from 'jest';

import { defaultConfig } from './src/carbonio-ui-commons/test/jest-config';
import { JEST_DEFAULT_TIMEZONE } from './src/constants/test-environment';

/* * For a detailed explanation regarding each configuration property and type check, visit: * https://jestjs.io/docs/configuration */

process.env.TZ = JEST_DEFAULT_TIMEZONE;
const config: Config = {
	...defaultConfig,
	collectCoverage: true,
	coverageReporters: ['lcov', 'html']
};
export default config;
