/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require('copy-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const customizeConfig = (config, pkg, options, mode) => {
	const newConfig = { ...config };

	newConfig.resolve = {
		...config.resolve,
		alias: {
			...(config.resolve?.alias || {}),
			'app-entrypoint': path.resolve(__dirname, 'src/app.tsx')
		},
		modules: [path.resolve(__dirname, 'src'), 'node_modules']
	};

	newConfig.plugins = [
		...(config.plugins || []),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(
						__dirname,
						'node_modules/@zextras/carbonio-ui-text-composer/dist/assets'
					),
					to: path.resolve(__dirname, 'dist/'),
					noErrorOnMissing: true
				}
			]
		})
	];

	return newConfig;
};

// Still required to keep the compatibility with the sdk
module.exports = customizeConfig;
