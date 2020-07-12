/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-07-08 10:57:53
 */

module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset',
        [
            '@babel/preset-env',
            {
                modules: false,
            },
        ],
    ],
    plugins: [
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-transform-runtime',
        '@vue/babel-plugin-transform-vue-jsx',
    ]
};
