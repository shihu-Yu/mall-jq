;(function($){

    function Search($elem,options){
        this.$elem = $elem
        this.$searchBtn   = $elem.find(options.$searchBtnSelector)
        this.$searchInput = $elem.find(options.$searchInputSelector)
        this.$searchLayer  = $elem.find(options.$searchLayerSelector)
        this.isAutocomplete = options.isAutocomplete
        this.url = options.url
        this.searchTimer = null
        this.isSearchLayerEmpty = true
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
        },
        getSearchData:function(){
            var _this = this
            var keyword = this.$searchInput.val()
            if(!keyword){
                this.appendSearchLayerHtml('')
                return
            }
            utils.ajax({
                url:this.url,
                data:{
                    keyword:keyword
                },
                success:function(data){
                    if(data.code == 0){
                        _this.renderSearchLayer(data.data)
                    }else{
                        _this.appendSearchLayerHtml('')
                    }
                },
                error:function(status){
                    _this.appendSearchLayerHtml('')
                }
            })
        },
    }
    /*
    Search.DEFAULTS = {
        searchBtnSelector: '.search-btn',
        searchInputSelector: '.search-input',
        searchLayerSelector: '.search-layer',
        url: '/products/search',
        isAutocomplete:false
    }
    */
    $.fn.extend({
        search:function(options){
            return this.each(function(){
                var $elem = $(this)
                var search = $elem.data('search')
                if(!search){
                    // options = $.extend({},DEFAULTS,options)
                    search = new Search($elem,options)
                    $elem.data('search',search)
                }
            })
        }
    })
})(jQuery)