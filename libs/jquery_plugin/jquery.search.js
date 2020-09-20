;(function($){
    var cache = {
        data:{

        },
        addData:function(key,value){
            this.data[key] = value
        },
        getData:function(key){
            return this.data[key]
        }
    }
    function Search($elem,options){
        this.$elem = $elem
        this.$searchBtn   = $elem.find(options.searchBtnSelector)
        this.$searchInput = $elem.find(options.searchInputSelector)
        this.$searchLayer  = $elem.find(options.searchLayerSelector)
        this.isAutocomplete = options.isAutocomplete
        this.url = options.url
        this.searchTimer = null
        this.isSearchLayerEmpty = true
        this.jqXHR = null
        this.init()
        if(this.isAutocomplete){
            this.autocomplete()
        }
    }
    Search.prototype = {
        constructor:Search,
        init:function(){
            this.$searchBtn.on('click',$.proxy(this.submitSearch,this))
        },
        submitSearch:function(){
            var keyword = this.$searchInput.val()
            window.location.href = './list.html?keyword=' + keyword
        },
        autocomplete:function(){
            //自动提示
            this.$searchInput
            .on('input',function(){
                
                if(this.searchTimer){
                    clearTimeout(this.searchTimer)
                }
                this.searchTimer = setTimeout(function(){
                    this.getSearchData()
                }.bind(this),300)
            }.bind(this))
            //获取焦点显示搜索提示层
            .on('focus',function(){
                if (!this.isSearchLayerEmpty){
                    this.$searchLayer.show()
                }
            }.bind(this))
            .on('click',function(ev){
                ev.stopPropagation()
            })

            //点击页面其他地方隐藏搜索提示层
            $(document).on('click',function(){
                this.$searchLayer.hide()
            }.bind(this))
             //事件委托处理提示层的提交
             var _this = this
             this.$searchLayer.on('click', '.search-item',function () {
                 var keyword = $(this).html()
                 _this.$searchInput.val(keyword)
                 _this.submitSearch()
             })
        },
        getSearchData:function(){
            var _this = this
            var keyword = this.$searchInput.val()
            if(!keyword){
                this.appendSearchLayerHtml('')
                return
            }

            //缓存 
            if(cache.getData(keyword)){
                _this.renderSearchLayer(cache.getData(keyword))
                return;
            }
            //终止上一次请求
            if(this.jqXHR){
                this.jqXHR.abort()
            }
            this.jqXHR = utils.ajax({
                url:this.url,
                data:{
                    keyword:keyword
                },
                success:function(data){
                    if(data.code == 0){
                        cache.addData(keyword,data.data)
                        _this.renderSearchLayer(data.data)
                    }else{
                        _this.appendSearchLayerHtml('')
                    }
                },
                error:function(status){
                    _this.appendSearchLayerHtml('')
                },
                complete:function(){
                    _this.jqXHR = null
                }
            })
        },
        renderSearchLayer:function(list){
            var len = list.length
            var html = ''
            if(len > 0){
                for(var i = 0;i<len;i++){
                    html += '<li class="search-item">' + list[i].name + '</li>'
                }
            }
            this.appendSearchLayerHtml(html)
        },
        appendSearchLayerHtml:function(html){
            if (html) {
                this.$searchLayer.show()
                this.$searchLayer.html(html)
                this.isSearchLayerEmpty = false
            } else {
                this.$searchLayer.hide()
                this.$searchLayer.html(html)
                this.isSearchLayerEmpty = true
            }
        },
    }
    
    Search.DEFAULTS = {
        searchBtnSelector: '.search-btn',
        searchInputSelector: '.search-input',
        searchLayerSelector: '.search-layer',
        url: '/products/search',
        isAutocomplete:false
    }
    
    $.fn.extend({
        search:function(options){
            return this.each(function(){
                var $elem = $(this)
                var search = $elem.data('search')
                if(!search){
                    options = $.extend({},Search.DEFAULTS,options)
                    search = new Search($elem,options)
                    $elem.data('search',search)
                }
            })
        }
    })
})(jQuery)