const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/ts/index.ts',

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },

            {
                test: [/\.css$/],
                use: ['css-loader'],
            },
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    output: {
        filename: 'js/bundle.js',
        path: path.resolve(__dirname, 'build'),
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
        }),

        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/css'),
                    to: path.resolve(__dirname, 'build/css'),
                },
                {
                    from: path.resolve(__dirname, 'src/libs'), // Указываем корневую папку
                    to: path.resolve(__dirname, 'build/css/[name][ext]'), // Указываем, куда копировать файлы
                    globOptions: {
                        ignore: ['**/!(*.css)'], // Исключаем всё, кроме `.css`
                        dot: true, // Включаем файлы, начинающиеся с точки, если нужно
                    },
                },
            ],
        }),
    ],
};
