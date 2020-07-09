/*
 * Author: 卓文理
 * Email: zhuowenligg@gmail.com
 * Date: 2020-01-08 14:40:43
 */

const path = require('path');

module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                '@web/*': path.resolve(__dirname, 'web/*'),
                '@components/*': path.resolve(__dirname, 'web/components/*'),
                '@directives/*': path.resolve(__dirname, 'web/directives/*'),
                '@mixins/*': path.resolve(__dirname, 'web/mixins/*'),
                '@pages/*': path.resolve(__dirname, 'web/pages/*'),
                '@services/*': path.resolve(__dirname, 'web/services/*'),
                '@store/*': path.resolve(__dirname, 'web/store/*'),
                '@stylesheet/*': path.resolve(__dirname, 'web/stylesheet/*'),
            },
            extensions: ['.js', '.vue', '.json', '.ts', '.tsx'],
        },
    },
};
