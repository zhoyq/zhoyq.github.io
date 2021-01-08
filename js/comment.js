var ZhoyqComment;

(function($){
    'use strict';

    ZhoyqComment = function(articleTitle){
        var self = this;
        self.articleTitle = articleTitle;
        self.commentDomain = location.host;
        self.cache = {
            comments: []
        };
        // 添加评论表单
        self.commentForm = $('#comment-form');
        // 表单提交按钮
        self.commentSubmit = $('#comment-submit');
        // 评论容器
        self.comments = $('#comments');
        // 服务基础地址
        self.commentServiceUrl = 'https://service.nothingjs.com/comment';
        // 当前页数
        self.page = 1;
        self.totalCount = -1;

        self.api = {
            fetchPage: function(page, callback) {
                var urlBuf = self.commentServiceUrl + '/comment/' + encodeURIComponent(self.articleTitle)
                    + '?domain=' + encodeURIComponent(self.commentDomain)
                    + '&page=' + page;
                $.get(urlBuf, function(res) {
                    callback(res);
                });
            },
            // id, comment, name, email, website
            addComment: function(json, callback) {
                var urlBuf = self.commentServiceUrl + '/comment';
                json.domain = location.host;
                $.post(urlBuf, json, function(res) {
                    callback(res);
                });
            },
            likeComment: function(id, callback) {
                var urlBuf = self.commentServiceUrl + '/comment/' + id + '/like';
                $.post(urlBuf, function(res) {
                    if (res.code === 200) {
                        for (var i = 0; i < self.cache.comments.length; i++) {
                            var bufData = self.cache.comments[i];
                            if (bufData.uuid === id) {
                                bufData.likes ++;
                                if(callback){
                                    callback(res);
                                }
                                break;
                            }
                        }
                    }
                });
            }
        };

        self.removeComments = function(){
            $('.comments').remove();
        };

        self.drawComments = function() {
            var buf = '';
            for (var i = 0; i < self.cache.comments.length; i++) {
                var bufData = self.cache.comments[i];
                buf += `
                <div class="comments media-block">
                    <a class="media-left" href="#"><img class="img-circle img-sm" alt="Profile Picture" src="${ctx}/img/profile-photos/${bufData.name[bufData.name.length-1].charCodeAt() % 10 + 1}.png"></a>
                    <div class="media-body">
                        <div class="comment-header">
                            <a href="${bufData.website}" class="media-heading box-inline text-main text-bold">${bufData.name}</a>
                            <p class="text-muted text-sm">${bufData.fromDate.substring(0, 10)}</p>
                        </div>
                        <p>${bufData.comment}</p>
                        <a href="javascript:commentInstance.api.likeComment('${bufData.uuid}', function(){commentInstance.refreshComments();});" class="btn btn-sm btn-primary"><i class="icon-lg demo-pli-like"></i> ${bufData.likes} Liked </a>
                    </div>
                </div>`;
            }
            $('#comments').append(buf);
            if (self.cache.comments.length !== self.totalCount) {
                $('#comments').append(`<div class="comments"><a href="javascript:commentInstance.addPage();commentInstance.refreshComments();" class="btn btn-sm btn-primary"><i class="icon-lg demo-pli-like"></i> 更多 </a></div>`);
            }
        };

        self.addPage = function(){
            self.page ++;
        }

        self.refreshComments = function() {
            self.removeComments();

            if (self.cache.comments.length === 0 || Math.floor((self.cache.comments.length - 1) / 10) + 1 < self.page) {
                self.api.fetchPage(self.page, function(res) {
                    if (res.data && res.data.topics) {
                        self.totalCount = res.data.totalCount;
                        for (var i = 0; i < res.data.topics.length; i++) {
                            var bufData = res.data.topics[i];
                            self.cache.comments.push(bufData);
                        }
                        self.drawComments();
                    }
                });
            } else {
                self.drawComments();
            }

        };

        self.submitComment = function() {
            self.cache.comments = [];
            var jsonBuf = {
                id: self.articleTitle
            };
            var formArray = self.commentForm.serializeArray();
            for (var i = 0; i < formArray.length; i++) {
                jsonBuf[formArray[i]['name']] = formArray[i]['value'];
            }
            self.api.addComment(jsonBuf, function(res) {
                self.refreshComments();
            });
        };

        self.commentSubmit.click(function() {
            self.submitComment();
        });

        self.refreshComments();

        return self;
    };
})(jQuery);

var commentInstance = new ZhoyqComment(articleTitle);
