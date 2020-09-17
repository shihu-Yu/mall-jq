;(function($){
    function Search($elem,options){
        this.$elem = $elem
        this.$searchBtn   = $elem.find(options.$searchBtnSelector)
        this.$searchInput = $elem.find(options.$searchInputSelector)
        this.$searchLayer  = $elem.find(options.$searchLayerSelector)
        this.url = options.url
        this.init()
    }
    Search.propotype = {
        constructor:Search,
        init:function(){
            this.$searchBtn.on('click',$.proxy(this.submitSearch,this))
        },
        submitSearch:function(){
            var keyword = this.$searchInput.val()
            window.location.href = './list.html?keyword=' + keyword
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
                    options = $.extend({},DEFAULTS,options)
                    search = new Search($elem,options)
                    $elem.data('search',search)
                }
            })
        }
    })
})(jQuery)