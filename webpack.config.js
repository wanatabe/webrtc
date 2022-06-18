const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const getAddress = require('./getIp');

module.exports = (env) => {
	const mode = env.production ? 'production' : 'development'
	const host = getAddress()
	console.log('env :>> ', host);
	console.log(path.resolve('./server/key/test.key'));

	return {
		entry: { home: path.resolve(__dirname, 'clint/js/index.ts') },
		output: {
			filename: '[name].js',
			path: path.resolve('dist'),
			// clear: true
		},

		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader'
					]
				},
				{
					test: /\.tsx?$/,
					use: ["ts-loader"],
					exclude: "/node_modules/"
				}
			]
		},
		optimization: {
			moduleIds: 'named'
		},
		mode,
		devServer: {
			host,
			static: './dist',
			hot: true,
			server: {
				type: 'https',
				options: {
					key: path.resolve('./sslKey/test.key'),
					cert: path.resolve('./sslKey/test.crt'),
					passphrase: 'webpack-dev-server'
				},
			}
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new CleanWebpackPlugin(),
			new HtmlWebpackPlugin({
				filename: `index.html`, //生成的文件名
				template: `./clint/index.html`, //文件模板不穿会生成一个默认Body内容为空的HTML文件
				inject: true,
				title: 'webpack5',
				chunks: ['home'], // chunks为该页面要包含的js文件
			}),
			new MiniCssExtractPlugin()
		]
	}
};