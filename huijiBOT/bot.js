module.exports = (function() {
	'use strict';
	var config = require('../config');
	var async = require('async');
	var request = require('request');
	var querystring = require('querystring');

	var HuijiBot = function(params){
		var path = params.path || '/';
		var siteDomain = params.siteDomain || 'www.huiji.wiki';
		this.url = "http://"+siteDomain+path+"api.php";
	};

	
	var httpRequest = function(method,data, url, httpCallback){
		var options ={
			method: method,
			url : url,
			form : data,
			jar : true

		};
		
		var callback = function(error , response, body){
			if(!error && response.statusCode == 200){
				httpCallback(null,body);
			}else{
				error = error || response.statusCode;
				httpCallback(error.toString());
			}
		}
		var req = request.post(options, callback);
 	};





	HuijiBot.prototype = {

  		login: function(username, userpassword, loginCallback){

			var self = this;
			var data = {
				action: 'login',
				lgname: username,
				lgpassword: userpassword,
				format: 'json'
			}
			async.waterfall(
                       		[
					
                                	function(callback){
                                        	httpRequest('POST', data, self.url, callback);
                               		 },
                               		function(out, callback){
						var token = JSON.parse(out).login.token;
						data.lgtoken = token;
				               	httpRequest('POST',data, self.url, callback);
                               		 }
                       		],function(err, result){
                                	if(err){
                                        	loginCallback(err);
                                	}
                                	else{	
						self.token = JSON.parse(result).login.lgtoken;
                                        	loginCallback(null, result);
                                	}
                       		}
			);
		},

		getToken : function(getTokenCallback){
			var data = {
				action: 'query',
                        	meta: 'tokens',
				format: 'json',
			};
			var self = this;
			httpRequest('POST', data, self.url, function(err,result){	
				if(err){
					getTokenCallback(err);
				}else{
					getTokenCallback(null, result);
				}	
			});

		},	
		

		editWithToken :  function(title, content, summary, token, editCallback){
			var self = this;
			var data = {
				action: 'edit',
				title: title,
				text: content,
				summary: summary,
				format: 'json',
				bot: true,
				token: token
			};

			
			//console.log(token);
			httpRequest('POST', data, self.url, function(err, result){
				if(err){ 
					editCallback(err);
				}else{ 
					editCallback(null, result);
				}
			});
		},


		edit: function(title, content, summary, editCallback){
			var self = this;
			if(self.token == null){
				editCallback("Not logged in.");
				return;
			}
			
			async.waterfall(
                                [

                                        function(callback){
                                                HuijiBot.prototype.getToken.call(self,callback);
                                         },
                                        function(out, callback){	
                                                var token = JSON.parse(out).query.tokens.csrftoken;
						HuijiBot.prototype.editWithToken.call(self,title, content, summary, token, editCallback)
                                         }
                                ],function(err, result){
                                        if(err){
                                               editCallback(err);
                                        }
                                        else{
                                        editCallback(null, result);
                                        }
                                }
                        );
		}
	}	
	
	return HuijiBot;

}());





