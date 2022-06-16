import path from 'path';
import CleanWebpackPlugin from 'clean-webpack-plugin';

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	devServer: {
		host: ""
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
	]
};