var ZhoyqSearch;

(function($) {
  'use strict';

  /**
  * Search by Zhoyq generator json content
  * @param options : (object)
  */
  ZhoyqSearch = function(){
    var self = this;
    self.endpoint = ctx + '/content.json';
    self.cache = '';

    /**
     * Search queryText in title and content of a post
     */
    self.contentSearch = function(post, queryText) {
      var post_title = post.title.trim().toLowerCase(),
          post_content = post.content.trim().toLowerCase(),
          keywords = queryText.trim().toLowerCase().split(" "),
          foundMatch = false,
          index_title = -1,
          index_content = -1,
          first_occur = -1;
      if (post_title !== '' && post_content !== '') {
        $.each(keywords, function(index, word) {
          index_title = post_title.indexOf(word);
          index_content = post_content.indexOf(word);
          if (index_title < 0 && index_content < 0) {
            foundMatch = false;
          }
          else {
            foundMatch = true;
            if (index_content < 0) {
              index_content = 0;
            }
            if (index === 0) {
              first_occur = index_content;
            }
          }
          if (foundMatch) {
            post_content = post.content.trim();
            var start = 0, end = 0;
            if (first_occur >= 0) {
              start = Math.max(first_occur-30, 0);
              end = (start === 0) ? Math.min(200, post_content.length) : Math.min(first_occur+170, post_content.length);
              var match_content = post_content.substring(start, end);
              keywords.forEach(function(keyword) {
                var regS = new RegExp(keyword, "gi");
                match_content = match_content.replace(regS, "<b class=\"custom-color-red\">"+keyword+"</b>");
              });
              post.digest = match_content;
            }
            else {
              end = Math.min(200, post_content.length);
              post.digest = post_content.trim().substring(0, end);
            }
          }
        });
      }
      return foundMatch;
    };

    /**
     * Generate result list html
     * @param data : (array) result items
     */
    self.buildResultList = function(data, queryText) {
      var results = [],
          html = "";
      $.each(data, function(index, post) {
        if (self.contentSearch(post, queryText))
          html += self.buildResult(ctx + post.url, post.title, post.digest);
      });
      return html;
    };

    /**
     * Generate html for one result
     * @param url : (string) url
     * @param title : (string) title
     * @param digest : (string) digest
     */
    self.buildResult = function(url, title, digest) {
      var html = "";
      html = "<li>";
      html +=   "<a class='result' href='" +url+ "'>";
      html +=     "<span class='title'>" +title+ "</span>";
      html +=     "<span class='digest'>" +digest+ "</span>";
      html +=     "<span class='icon pli-arrow-right'></span>";
      html +=   "</a>";
      html += "</li>";
      return html;
    };

    /**
     * Send a GET request
     */
    self.query = function(queryText, callback) {
      if (!self.cache) {
        fetch(self.endpoint)
          .then(r => r.json())
          .then((data) => {
              self.cache = data;
              var results = "";
              results += self.buildResultList(data, queryText);
              if (callback) {
                callback(results);
              }
          })
          .catch((error) => {
              console.error('query ' + queryText + ' failed !');
          });
      }
      else {
        var results = "";
        results += self.buildResultList(self.cache, queryText);
        if (callback) {
          callback(results);
        }
      }
    };

    return self;
  };

})(jQuery);

var searchInstance = new ZhoyqSearch();

// 屏蔽全局事件监听 仅对搜索聚焦的时候才会监听事件
$('#search-input').focus(function() {
  // 注册事件
  document.onkeyup = function(event) {
    var searchStr = $('#search-input').val();
    if (searchStr !== '' && event.keyCode === 13) {
      searchInstance.query(searchStr, function(html){
          // 设置标题
          $('#search-modal-title').text('搜索结果');
          // 设置内容
          $('#search-modal-body').html(html);
          // 显示
          $('#search-modal').modal();
      });
    }
  };
});

$('#search-input').blur(function() {
  // 取消注册事件
  document.onkeyup = function(){};
});

