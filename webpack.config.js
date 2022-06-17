const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack')

module.exports = (env) => {
	const mode = env.production ? 'production' : 'development'

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
			static: './dist',
			hot: true
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