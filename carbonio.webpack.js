/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const { execSync } = require('child_process');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const customizeConfig = (config, pkg, options, mode) => {
	const newConfig = { ...config };

	const commitHash = execSync('git rev-parse HEAD').toString().trim();
	const baseStaticPath = `/static/iris/carbonio-mails-ui/${commitHash}/`;

	newConfig.resolve = {
		...config.resolve,
		alias: {
			...(config.resolve?.alias || {}),
			'app-entrypoint': path.resolve(__dirname, 'src/app.tsx')
		},
		modules: [path.resolve(__dirname, 'src'), 'node_modules']
	};
	newConfig.plugins = newConfig.plugins || [];
	newConfig.plugins.push(
		new webpack.DefinePlugin({
			BASE_PATH: JSON.stringify(baseStaticPath)
		})
	);

	newConfig.plugins.push(
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
	);

	return newConfig;
};

// Still required to keep the compatibility with the sdk
module.exports = customizeConfig;
