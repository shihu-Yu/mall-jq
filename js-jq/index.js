(function(w,d){
    var page = {
        init:function(){
            this.$cartCount = $('.cart-count')
            this.$cartBox = $('.cart-box')
            this.$cartContent = $('.cart-content')

            this.$categories  = $('.categories')

            this.$parentCategories = $('.parent-categories')
            this.$childCategories = $('.child-categories')
            this.$swiper = $('.swiper')
            this.$hotProductList = $('.hot .product-list')
            this.$win = $(w)
            this.cartTimer = null
            this.categoriesTimer = null
        
            this.childCategoriesCache = {}
            
            this.handleCart()
            this.handleSerach()
            
            this.handleCategories()
            this.handleCarousel()
            this.handlehotProductList()

            this.$floorContainer = $('.floor .container')
            this.$elevator = $('#elevator')
            this.handleFloor()
            this.handleElevator()
        
        },
        loadCartCount:function(){
            var _this = this
            utils.ajax({
                url:'/carts/count',
                success:function(data){
                    if(data.code == 0){
                        _this.$cartCount.html(data.data)
                    }  
                },
            })
        },
        handleCart:function(){
            var _this = this
            this.loadCartCount()
            this.$cartBox.on('mouseenter',function(){

                if(_this.cartTimer){
                    clearTimeout(_this.cartTimer)
                }
                _this.cartTimer = setTimeout(function(){
                    _this.$cartContent.show()
                    //显示loading状态
                    _this.$cartContent.html('<div class="loader"></div>')
                    utils.ajax({
                        url: '/carts',
                        success: function (data) {
                            if (data.code == 0) {
                                _this.renderCart(data.data.cartList)
                            } else {
                                _this.$cartContent.html('<span class="empty-cart">获取购物车失败,请稍后再试!</span>')
                            }
                        },
                        error: function (status) {
                            _this.$cartContent.html('<span class="empty-cart">获取购物车失败,请稍后再试!</span>')
                        }
                    })
                },300)
            })
            //隐藏下拉购物车
            .on('mouseleave',function(){
                if (_this.cartTimer) {
                    clearTimeout(_this.cartTimer)
                }
                _this.$cartContent.hide()
            })      
        },
        renderCart:function(list){
            var len = list.length
            if(len>0){
                var html = ''
                html += '<span class="cart-tip">最近加入的宝贝</span>'
                html += '<ul>'
                for(var i = 0;i<len;i++){
                    html += '<li class="cart-item clearfix">'
                    html += '   <a href="#" target="_blank">'
                    html += '       <img src="'+list[i].product.mainImage+' " alt=" ">'
                    html += '       <span class="text-ellipsis">'+list[i].product.name+'</span>'
                    html += '   </a>'
                    html += '   <span class="product-count">x '+list[i].count+' </span><span class="product-price">'+list[i].product.price+'</span>'
                    html += '</li>'
                }
                html += '</ul>'
                html += '<span class="line"></span>'
                html += '<a href="/cart.html" class="btn cart-btn">查看我的购物车</a>'
                this.$cartContent.html(html)
            }else{
                this.$cartContent.html('<span class="empty-cart">购物车中还没有商品,赶紧来购买吧!</span>')
            }
        },


        handleSerach:function(){

            $('.search-box').search({
                searchBtnSelector:'.btn-search',
                searchInputSelector:'.search-input',
                searchLayerSelector:'.search-layer',
                isAutocomplete:true
            })
          
        },
        handleCategories:function(){
            var _this = this
            this.getParentCategoriesData()

            //利用事件代理触发
            this.$categories
            .on('mouseover','.parent-categories-item',function(){
                
                var $elem = $(this)
                if(_this.categoriesTimer){
                    clearTimeout(_this.categoriesTimer)
                }
                $elem.addClass('active').siblings().removeClass('active')
                _this.categoriesTimer = setTimeout(function(){
                    _this.$childCategories.show()
                    var pid = $elem.data('id')
                    //判断缓存中是否有数据
                    if(_this.childCategoriesCache[pid]){
                        _this.renderChildCategories(_this.childCategoriesCache[pid])
                    }else{
                        _this.getChildCategoriesData(pid)
                    }
                },300)
            })
            .on('mouseleave',function(){
                if(_this.categoriesTimer){
                    clearTimeout(_this.categoriesTimer)
                }
                _this.$childCategories.hide().html('')
                _this.$parentCategories.find('.parent-categories-item').removeClass('active')
            })
        },
        
        getParentCategoriesData:function(){
            
            var _this = this
            utils.ajax({
                url:'/categories/arrayCategories',
                success:function(data){
                    if(data.code == 0){
                        _this.renderParentCategories(data.data)
                    }
                }
            })  
        },
        getChildCategoriesData:function(pid){
            var _this = this
            this.$childCategories.html('<div class="loadder"></div>')
            utils.ajax({
                url:'/categories/childArrayCategories',
                data:{
                    pid:pid
                },
                success:function(data){
                    if(data.code == 0){
                        _this.renderChildCategories(data.data)
                        //缓存数据
                        _this.childCategoriesCache[pid] = data.data
                    }
                }
            })
        },
        renderParentCategories:function(list){
            var len = list.length
            
            if(len>0){
                var html = '<ul>'
                for(var i=0;i<len;i++){
                    html += '<li class="parent-categories-item"  data-id="'+list[i]._id+'" data-index="'+i+'">'+list[i].name+'</li>'
                }
                html += '</ul>'
                this.$parentCategories.html(html)
            }
        },
        renderChildCategories:function(list){
            var len = list.length
            if(len>0){
                var html = '<ul>'
                for(var i= 0 ;i<len;i++){
                    html += `<li class="child-item">
                                <a href="#">
                                    <img src="${list[i].icon}" alt="">
                                    <p>'${list[i].name}'</p>
                                </a>
                            </li>`
                }
                html += '</ul>'
                this.$childCategories.html(html)
            }         
        },
        handleCarousel:function(){
            var _this = this
            utils.ajax({
                url:'/ads/positionAds',
                data:{
                    position:1
                },
                success:function(data){
                    if(data.code == 0){
                        _this.renderCarousel(data.data)
                    }
                }
            })
        },
        renderCarousel:function(list){
            var imgs = list.map(function(item){
                return item.imageUrl
            })
            this.$swiper.carousel({
                imgs:imgs,
                width: 862,
                height: 440,
                playInterval: 0,
                type:'slide'
            })
        },
        handlehotProductList:function(){
            var _this = this
            //防抖函数包装
            this.$hotProductList.betterFn = utils.debounce(function(){
                
                if(utils.isVisibility(_this.$hotProductList)){
                    utils.ajax({
                        url:'/products/hot',
                        success:function(data){
                            if(data.code == 0){
                                _this.renderHotProductList(data.data)
                            }
                        } 
                    })
                }
            },300)
            this.$win.on('scroll resize load',this.$hotProductList.betterFn)  
        },
        renderHotProductList:function(list){
            var len = list.length
            if(len>0){
                var html = ''
                for(var i=0;i<len;i++){
                    html += `<li class="product-item col-1 col-gap">
                                <a href="#">
                                    <img data-src="${list[i].mainImage}" width="180px" height="180px" src="./images/loading.gif"> 
                                        <p class="product-name">${list[i].name}</p>
                                    <div class="product-price-number">
                                        <span class="product-price">&yen;${list[i].price}</span>
                                        <span class="product-number">${list[i].payNums}人已购买</span>
                                    </div>
                                </a>
                            </li>`
                }
                this.$hotProductList.html(html)
                //移除事件
                this.$win.off('scroll resize load',this.$hotProductList.betterFn)
                //获取图片地址 加载图片
                this.$hotProductList.find('.product-item img').each(function(){
                    var $img = $(this)
                    var imgSrc = $img.data('src')
                    utils.loadImage(imgSrc,function(){
                        $img.attr('src', imgSrc)
                    })
                })
            }
        },
        handleFloor:function(){
            var _this = this
            _this.$floorContainer.betterFn = utils.debounce(function(){
                
                //判断是否在可视区，如果是就发送请求 不是就不发送
                if(utils.isVisibility(_this.$floorContainer)){
                    utils.ajax({
                        url:'/floors',
                        success:function(data){
                           if(data.code == 0){
                               _this.renderFloor(data.data)
                           }
                        }
                    })
                }
            },300)
            
            this.$win.on('scroll resize load', _this.$floorContainer.betterFn)
        },
        renderFloor:function(list){
            var len = list.length
                var html = ''
                var elevatorHtml = ''
                for(var i =0;i<len;i++){
                    html += `<div class="floor-wrap">
                                <div class="floor-swap1">
                                            <a href="#" class="hd">
                                                <h2>F${list[i].num} ${list[i].title}</h2>
                                            </a>
                                        </div>
                                        <div class="floor-product ">
                                            <ul class="prouct-list clearfix">`
                    for(var j = 0,len1= list[i].products.length;j<len1;j++){
                        var product = list[i].products[j]
                        html +=                 `<li class="product-item col-1 col-gap">
                                                    <a href="#">
                                                        <img  width="180px" height="180px" data-src="${product.mainImage}" src="./images/loading.gif"> 
                                                            <p class="product-name">${product.name}</p>
                                                        <div class="product-price-number">
                                                            <span class="product-price">&yen;${product.price}</span>
                                                            <span class="product-number">${product.payNums}人已购买</span>
                                                        </div>
                                                    </a>
                                                </li>`
                    }
                        html +=         `</ul>
                                    </div>
                                </div>`
                        elevatorHtml +=`<a href="javascript:;" class="elevator-item">
                                            <span class="elevator-item-num">F${list[i].num}</span>
                                            <span class="elevator-item-text text-ellipsis" data-num="${i}">${list[i].title}</span>
                                        </a>`
                }
                elevatorHtml += `<a href="javascript:;" class="backToTop" >
                                     <span class="elevator-item-num"><i class="iconfont icon-arrow-up"></i></span>
                                     <span class="elevator-item-text text-ellipsis" id="backToTop">顶部</span>
                                 </a>`
                this.$floorContainer.html(html)
                //移除事件
                this.$win.off('scroll resize load', this.$floorContainer.betterFn)
                this.handleFloorImage()
                this.$elevator.html(elevatorHtml)    
        },
        handleFloorImage:function(){
            var _this = this
            var $floors = $('.floor .floor-wrap')
            //已经加载图片的楼层个数
            var totalLoadedNum = 0
            //需要加载图片的楼层个数
            var totalNum = $floors.length
            var betterFn = utils.debounce(function(){
                $floors.each(function(){
                    var $floor = $(this)
                    //判断是否加载过
                    if ($floor.data('isLoaded')){
                        return
                    }

                    if(utils.isVisibility($floor)){
                        var $imgs = $floor.find('img')
                        $imgs.each(function(){
                            var $img = $(this)
                            var imgSrc = $img.data('src')
                            utils.loadImage(imgSrc,function(){
                                //改变src属性 把请求回来的地址附上去
                                $img.attr('src',imgSrc)
                            })
                        })
                        $floor.data('isLoaded',true)
                        totalLoadedNum++
                        //所有楼层的图片都加载完毕
                        if(totalLoadedNum == totalNum){
                            //清除事件
                            $floors.trigger('loaded')   
                        }
                    }
                })
            },300)
            this.$win.on('scroll resize load',betterFn)
            $floors.on('loaded',function(){
                _this.$win.off('scroll resize load', betterFn)
            })
        },
        handleElevator:function(){
            var _this = this 
            //点击楼层返回到楼层显示区域
            this.$elevator.on('click','.elevator-item-text',function(){
                var $elem = $(this)
                if($elem.attr('id') == 'backToTop'){
                    $('html,body').animate({
                        scrollTop:0
                    })
                }else{
                    $('html,body').animate({
                        scrollTop:$('.floor-wrap').eq($elem.data('num')).offset().top
                    })
                }
            })
             //根据楼层显示电梯
             var betterSetElevator = utils.debounce(function(){
                _this.setElevator() 
             },300)
             this.$win.on('scroll resize load',betterSetElevator)
        },
        setElevator:function(){
            var num = this.getFloorNum()
            if(num == -1){
                this.$elevator.hide()
            }else{
                this.$elevator
                .show()
                .find('.elevator-item')//这里是选择器
                .removeClass('elevator-active')
                .eq(num).addClass('elevator-active')
            }
        },

        //获取楼层号
        getFloorNum:function(){
            var _this = this
            //设置的默认楼层号
            var num = -1
            $('.floor .floor-wrap').each(function(index){
                num = index
                var $floor = $(this)
                if($floor.offset().top > _this.$win.scrollTop() + _this.$win.height() / 2){
                    num = index - 1
                    return false
                }
            })
            return num
        }
    }
    
    page.init()    
})(window,document);



