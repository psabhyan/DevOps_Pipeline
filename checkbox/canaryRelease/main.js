var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var request = require("request");
var http    = require('http');
var httpProxy = require('http-proxy');
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
var portNum=3020;
var serverMap=new Array();
var cnt=1;
var isAlert=false;
var canaryAddress="";

//client.del("serverList");
//console.log("serverList initialized...");
//client.sadd("serverList", "http://104.131.28.221:80");
//client.sadd("serverList", "http://104.131.93.107:80");
//console.log("both checkboxes are added to serverList...");


// server

var server= app.listen(9000,function(req, res) {
        console.log("serverCreated...!!");
       // res.write("got connection");
        //res.end();
        var i=0;
        try {
                var data=fs.readFileSync('prodCanary','utf8').toString().split("\n");
                console.log("Prod Canary IP = \n" + data);
                client.del("canaryList");
                for(i=0;i<(data.length-1);i++)
                {
                        var address="http://"+data[i];
                        canaryAddress=address;
                        console.log("added = " + address);
                        client.sadd("canaryList",address);
                }
                data=fs.readFileSync('prodStable','utf8').toString().split("\n");
                console.log("Stable servers IP = \n" + data);
                client.del("serverList");
                for(i=0;i<(data.length-1);i++)
                {
                        var address="http://"+data[i];
                        console.log("added = "+ address);
                        client.sadd("serverList", address);
                }
        } catch(e) {
                console.log('Error', e.stack);
        }

        console.log("instance IP file read done...");


       // client.del("serverList");
        //console.log("serverList initialized...");
        //client.sadd("serverList", "http://104.131.28.221:80");
       // client.sadd("serverList", "http://104.131.93.107:80");
        console.log("both stable checkboxes are added to serverList...");

        //client.del("canaryList");
        //console.log("canaryList initialized...");
        //client.sadd("canaryList", "http://104.236.124.6:80");
        //client.sadd("canaryList", "http://104.131.93.107:80");
        console.log("canary checkboxes are added to canaryList...");
});
server.listen(9000);

// proxy

var proxy = httpProxy.createProxyServer({});

var pServer = http.createServer(function (req, res) {
        console.log("isAlert raised = " + isAlert);
        if(cnt<5 || isAlert == true)
        {
                console.log("STABLE SERVERS PROD...");
                client.spop("serverList", function(err, serverInfo) {
                        var tval=serverInfo;
                        console.log("proxy target serverInfo = " + tval);
                        proxy.web(req, res, { target: tval});
                        client.sadd("serverList",tval);
                 });
                cnt=cnt+1;
        }
        else
        {
                console.log("CANARY PROD...");
                client.spop("canaryList", function(err, serverInfo) {
                        var tval=serverInfo;
                        console.log("proxy target serverInfo = " + tval);
                        proxy.web(req, res, { target: tval});
                        client.sadd("canaryList",tval);
                 });
                cnt=1;
        }
        console.log("pserver done...!");
        //res.write("pServer process");
});
pServer.listen(80);
console.log("proxyServer started to listening to port 80...");

///////////// WEB ROUTES

app.get('/', function(req, res) {
  console.log("inside blank method...");
  res.send('hello world');
});

var interval = setInterval(function() {
        console.log("checking status of canary prod...");
        //console.log("canary prod http://104.236.124.6:80... ");
        //var canaryAddress = "http://104.236.124.6:80";
        request(canaryAddress,{method: "GET",timeout: 2000},function(err,response,body){
                if(err || response == undefined || response.statusCode !=200)
                {
                        if(isAlert==false)
                         {
                                isAlert=true;
                                console.log("Canary PROD connection is not working. ALERT is raised!!!");
                         }
                }
                else
                {
                        //console.log("canary prod connection timer result");
                        //console.log(response);
                        //console.log(body);
                        console.log("canary prod is up and working...");
                        isAlert=false;
                }

        });
}, 5000);
