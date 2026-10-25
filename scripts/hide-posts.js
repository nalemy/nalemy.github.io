'use strict';

// 隐藏文章:front-matter 写 hidden: true 后,不出现在首页/归档/分类/标签,
// 但通过直链仍可以访问。
// 说明:Hexo 8 原生会把 hidden 文章从 locals.posts 排除(首页/归档不再显示),
// 但分类页的生成器直接遍历分类下的文章,不看 hidden;文章页面也不会生成。
// 本脚本补齐这两点:覆盖分类生成器过滤 hidden 文章 + 单独生成隐藏文章的页面。

hexo.extend.filter.register('before_generate', () => {
    hexo._hiddenPosts = hexo.model('Post').filter(post => post.hidden).data;
});

// 覆盖 Hexo 内置的 'posts' locals(首页、归档、挂件等渲染数据都来自它),
// 在原有的按日期/草稿过滤之上,再排除 hidden 文章,使其在渲染层全局不可见
hexo.locals.set('posts', () => {
    const query = {};
    if (!hexo.config.future) {
        query.date = { $lte: Date.now() };
    }
    if (!hexo._showDrafts()) {
        query.published = true;
    }
    return hexo.database.model('Post').find(query).filter(post => !post.hidden);
});

// 被隐藏的文章单独生成页面,路由与普通文章一致
hexo.extend.generator.register('hidden-posts', () =>
    (hexo._hiddenPosts || []).map(post => ({
        path: post.path,
        layout: 'post',
        data: post
    }))
);

// 覆盖 hexo-generator-category 的 'category' 生成器(同名注册,后注册者生效):
// 分类页过滤 hidden 文章;整类都被隐藏时生成一个空列表页,避免挂件链接 404
hexo.extend.generator.register('category', locals => {
    const pagination = require('hexo-pagination');
    const cg = hexo.config.category_generator || {};
    const perPage = cg.per_page;
    const orderBy = cg.order_by || '-date';
    const format = (hexo.config.pagination_dir || 'page') + '/%d/';
    return locals.categories.reduce((result, category) => {
        const posts = category.posts.sort(orderBy).filter(post => !post.hidden);
        if (!posts.length) {
            return result.concat({
                path: category.path,
                layout: ['category', 'archive', 'index'],
                data: { category: category.name, parents: [], posts: [] }
            });
        }
        return result.concat(pagination(category.path, posts, {
            perPage,
            layout: ['category', 'archive', 'index'],
            format,
            data: { category: category.name, parents: [] }
        }));
    }, []);
});

// 覆盖 hexo-generator-tag 的 'tag' 生成器,逻辑与上面的 'category' 覆盖一致:
// 标签页过滤 hidden 文章;整类隐藏的标签生成空列表页,避免链接 404
hexo.extend.generator.register('tag', locals => {
    const pagination = require('hexo-pagination');
    const tg = hexo.config.tag_generator || {};
    const perPage = tg.per_page !== undefined ? tg.per_page : hexo.config.per_page;
    const orderBy = tg.order_by || '-date';
    const format = (hexo.config.pagination_dir || 'page') + '/%d/';
    return locals.tags.reduce((result, tag) => {
        const posts = tag.posts.sort(orderBy).filter(post => !post.hidden);
        if (!posts.length) {
            return result.concat({
                path: tag.path,
                layout: ['tag', 'archive', 'index'],
                data: { tag: tag.name, posts: [] }
            });
        }
        return result.concat(pagination(tag.path, posts, {
            perPage,
            layout: ['tag', 'archive', 'index'],
            format,
            data: { tag: tag.name }
        }));
    }, []);
});
