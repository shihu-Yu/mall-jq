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
            /*
            
            this.floorContainer = d.querySelector('.floor .container')
            this.elevator = d.querySelector('#elevator')
            
            this.searchTimer = null
            this.lastActiveIndex = 0
            this.parentCategoriesItem = null
            this.categoriesTimer = null

            this.elevatorTimer = null
            this.elevatorItems = null
            this.floors = null
            
            this.isSearchLayerEmpty = true
            this.handleFloor()
            this.handleElevator()
            */
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
            var betterFn = utils.debounce(function(){
                //判断是否加载过
                if(_this.$hotProductList.data('isLoaded')){
                    return
                }
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
            })
            this.$win.on('scroll resize load', betterFn)  
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
                //保存是否加载的状态
                this.$hotProductList.data('isLoaded',true)
                //加载图片
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
            utils.ajax({
                url:'/floors',
                success:function(data){
                    _this.renderFloor(data.data)
                }
            })
        },
        renderFloor:function(list){
            var len = list.length
                var html = ''
                var elevatorHtml = ''
                for(var i =0;i<len;i++){
                    html += `<div class="floor-swap1">
                                <a href="#" class="hd">
                                    <h2>F${list[i].num} ${list[i].title}</h2>
                                </a>
                            </div>
                            <div class="floor-product ">
                                <ul class="prouct-list clearfix">`
                    for(var j = 0,len1= list[i].products.length;j<len1;j++){
                        var product = list[i].products[j]
                        html +=     `<li class="product-item col-1 col-gap">
                                        <a href="#">
                                            <img src="${product.mainImage}" width="180px" height="180px"> 
                                                <p class="product-name">${product.name}</p>
                                            <div class="product-price-number">
                                                <span class="product-price">&yen;${product.price}</span>
                                                <span class="product-number">${product.payNums}人已购买</span>
                                            </div>
                                        </a>
                                    </li>`
                    }
                        html += `</ul>
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
                this.floorContainer.innerHTML = html
                this.elevator.innerHTML = elevatorHtml
                this.floors = d.querySelectorAll('.floor-swap1')
                console.log(this.floors)
                this.elevatorItems = d.querySelectorAll('.elevator-item')
                
        },
        handleElevator:function(){
            var _this = this 
            //点击楼层返回到楼层显示区域
            this.elevator.addEventListener('click',function(ev){
                var elem = ev.target
                if(elem.id == 'backToTop'){
                    d.documentElement.scrollTop = 0
                }else if(elem.className == 'elevator-item-text text-ellipsis'){
                    var num = elem.getAttribute('data-num')
                    if(!_this.floors){
                        teturn
                    }
                    var floor = _this.floors[num]
                    d.documentElement.scrollTop = floor.offsetTop
                }
            },false)
             //楼层进入可视区设置电梯状态
             var betterSetElevator = function(){
                 
                 if(_this.elevatorTimer){
                     clearTimeout(_this.elevatorTimer)
                 }
                 _this.elevatorTimer = setTimeout(function(){
                    
                     _this.setElevator()     
                },200)
             }
             w.addEventListener('scroll',betterSetElevator,false)
             
             w.addEventListener('resize',betterSetElevator,false)
             
             w.addEventListener('load',betterSetElevator,false)
        },
        setElevator:function(){
            if (!this.elevatorItems){
                return
            }
            
            var num = this.getFloorNum()
            
            if(num == -1){
                utils.hide(this.elevator)
            }else{
                utils.show(this.elevator)
                for(var i = 0,len = this.elevatorItems.length;i<len;i++){
                    if (num == i) {
                        this.elevatorItems[i].className = 'elevator-item elevator-active'
                    } else {
                        this.elevatorItems[i].className = 'elevator-item'
                    }
                }
            }

        },
        getFloorNum:function(){
            
            var num = -1
           
            if(!this.floors){
                return num
            }
            for(var i=0,len = this.floors.length;i<len;i++){
                var floor = this.floors[i]
                
                num = i
                if(floor.offsetTop > d.documentElement.scrollTop + d.documentElement.clientHeight / 2){
                    num = i - 1
                    break
                }
            }
            return num
        }
    }
    
    
    page.init()    
})(window,document);



