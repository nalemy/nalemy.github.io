hexo.extend.injector.register('head_end', '<link rel="stylesheet" href="/css/custom.css">');

// GoatCounter 访问统计(脚本自托管在 /js/count.js,避免被 uBlock 按域名拦截)
hexo.extend.injector.register('head_end',
    '<script data-goatcounter="https://mouse-king.goatcounter.com/count" async src="/js/count.js"></script>');
