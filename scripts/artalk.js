'use strict';

// Artalk 前端接入:文章页的阅读量(PV)+ 点赞,不加载评论区、不设点踩。
// 全部使用 Artalk 公开 HTTP API(与官方前端一致):
//   PV 上报   POST /api/v2/pages/pv   {page_key, page_title, site_name} → {pv}
//   页面信息  GET  /api/v2/comments?page_key=&site_name= → {page: {id, vote_up, pv}}
//   投票     POST /api/v2/votes/page/{pageId}/up(同一 IP 重复点击 = 取消)
const SERVER_URL = 'https://mouse-king-hp.onrender.com';
const SITE_NAME = 'Mouse King';

hexo.extend.injector.register('body_end', `<script>
(function() {
    var SERVER = '${SERVER_URL}';
    var SITE = '${SITE_NAME}';
    var API = SERVER + '/api/v2';

    function isPost() {
        return location.pathname.indexOf('/posts/') === 0;
    }

    function api(method, path, body) {
        return fetch(API + path, {
            method: method,
            headers: body ? {'Content-Type': 'application/json'} : undefined,
            body: body ? JSON.stringify(body) : undefined
        }).then(function(r) {
            if (!r.ok) throw new Error(path + ' -> ' + r.status);
            return r.json();
        });
    }

    function clean(id) {
        var el = document.getElementById(id);
        if (el) el.parentNode.removeChild(el);
    }

    function mount() {
        if (!isPost()) return;
        clean('ak-widget');
        var key = location.pathname;

        // 文章末尾插入:一行居中,阅读量 + 点赞并排
        var article = document.querySelector('article .content');
        if (!article) return;
        var bar = document.createElement('div');
        bar.id = 'ak-widget';
        bar.innerHTML =
            '<span class="ak-views"><i class="far fa-eye"></i><span id="ak-pv-num">…</span> 次浏览</span>' +
            '<span class="ak-sep"></span>' +
            '<button type="button" id="ak-like" class="ak-btn"><i class="far fa-thumbs-up"></i><span id="ak-up-n">…</span></button>';
        article.appendChild(bar);

        var pvNum = document.getElementById('ak-pv-num');
        var likeBtn = document.getElementById('ak-like');
        var voted = false;
        try { voted = !!localStorage.getItem('ak-vote:' + key); } catch (e) {}
        if (voted) likeBtn.classList.add('is-active');

        // 一次公开请求拿全:pv 上报(顺带注册页面)→ 页面信息(id、赞数)
        api('POST', '/pages/pv', {page_key: key, page_title: document.title, site_name: SITE})
            .then(function(d) {
                if (typeof d.pv === 'number') pvNum.textContent = d.pv;
                return api('GET', '/comments?page_key=' + encodeURIComponent(key) + '&site_name=' + encodeURIComponent(SITE));
            })
            .then(function(d) {
                var page = d.page;
                if (!page || !page.id) return;
                document.getElementById('ak-up-n').textContent = page.vote_up;
                likeBtn.addEventListener('click', function() {
                    api('POST', '/votes/page/' + page.id + '/up', {})
                        .then(function(v) {
                            voted = !v.is_up ? false : true;
                            try {
                                if (v.is_up) localStorage.setItem('ak-vote:' + key, 'up');
                                else localStorage.removeItem('ak-vote:' + key);
                            } catch (e) {}
                            document.getElementById('ak-up-n').textContent = v.up;
                            likeBtn.classList.toggle('is-active', v.is_up);
                        })
                        .catch(function(err) { console.error('[Artalk]', err); });
                });
            })
            .catch(function(err) {
                console.error('[Artalk]', err);
                pvNum.textContent = '–';
            });
    }

    mount();
    document.addEventListener('pjax:success', mount);
})();
</script>`);
