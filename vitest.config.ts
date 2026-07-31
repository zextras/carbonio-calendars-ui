/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { VITEST_DEFAULT_TIMEZONE } from './src/constants/test-environment';

process.env.TZ = VITEST_DEFAULT_TIMEZONE;

const junitReporter: ['junit', { outputFile: string; console: boolean }] = [
	'junit',
	{ outputFile: 'junit.xml', console: false }
];

export default defineConfig({
	resolve: {
		tsconfigPaths: true
	},
	plugins: [
		react({
			jsxImportSource: '@emotion/react',
			babel: {
				plugins: ['@emotion/babel-plugin']
			}
		})
	],
	define: {
		BASE_PATH: JSON.stringify('/calendars')
	},
	test: {
		globals: true,
		environment: 'jsdom',
		server: {
			deps: {
				inline: ['@zextras/carbonio-ui-preview']
			}
		},
		setupFiles: [
			'./src/__test__/worker-setup.ts',
			'./src/__test__/vitest-setup.tsx',
			'./src/__test__/setup-browser-env.ts'
		],
		clearMocks: true,
		// mockReset: true,
		restoreMocks: true,
		maxWorkers: '50%',
		testTimeout: 5000,
		reporters: ['default', junitReporter],
		coverage: {
			enabled: true,
			provider: 'v8',
			reporter: ['cobertura', 'lcov'],
			reportsDirectory: 'coverage',
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['**/__test__/**', '**/tests/**', '**/mocks/**', '**/*.test.{js,jsx,ts,tsx}']
		},
		environmentOptions: {
			jsdom: {
				url: 'http://localhost'
			}
		}
	}
});
