var express = require('express')
var Mock = require('mockjs')

var app = express()

app.get('/carts/count',function(req,res){
    res.json(Mock.mock({
        "code":0,
        "data|1-100": 100
    }))
})

app.listen('3000',function(){
    console.log('server is running on http://127.0.0.1:3000')
})
