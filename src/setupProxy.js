// 配置多个代理使用这种方法
// 所有请求都走代理
const {createProxyMiddleware} = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        createProxyMiddleware('/b', {
            target: 'http://192.168.31.217:8082',
            changeOrigin: true,
            pathRewrite: {'^/b': ''} // 将前端路径中的/api1替换为后者，然后向后端请求
        })
        // ,createProxyMiddleware('/api2', {
        //     target: 'http://localhost:8889',
        //     changeOrigin: true,
        //     pathRewrite: {'^/api2': ''} // 将前端路径中的/api1替换为后者，然后向后端请求
        // })
    )
}

