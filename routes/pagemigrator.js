var crawler = require('./crawler');
var editor = require('./editor');
var auth = require('./huijiauth');
var bot  = require('nodemw');
var async = require('async');

module.exports = {

	getMainPage: function(mwDomain, callback){
		var client = new bot({
			server: mwDomain,
			path: '',
			debug: true
		});
		/**
		client.getArticle('MediaWiki:Mainpage', function(err, result){
			if(err){
				callback(err);
			}
			else{
				console.log('Main Page is ' + result);
				callback(null, result);
			}

		});
**/
		client.getSiteInfo('general', function(err,result){
			if(err){
				callback(err);
			}
			else{
				callback(null, result.general.mainpage);
			}
		});
	},

	migrateMainPage: function(fromDomain, toDomain, mmCallback){
		async.waterfall(
			[
				function(callback){
					module.exports.getMainPage(fromDomain,callback);
					//callback('Main Page');
				},

				function(mainPage, callback){
					pageSpecInfo = {};
					pageSpecInfo[mainPage]='首页';
					module.exports.migrateSinglePage(mainPage, fromDomain, toDomain, pageSpecInfo, callback);
				}
			],
			function(err,result){
				if(err){
					mmCallback(err);
				}
				else{
					mmCallback(null, result);
				}
			});
	},

	migrateSinglePage: function(page, fromDomain, toDomain, pageSpec,  mpCallback){
		async.waterfall(
			[
				function(callback){
					crawler.fetchAllContentInArticle(page, fromDomain, callback);
				},
				function(contentList, callback){
					editor.huijiArticleListEditor(contentList, pageSpec, toDomain,callback);
				}
			], function(err, result){
				if(err){
					mpCallback(err);
				}
				else{
					mpCallback(null, result);
				}
			});
	}

	
}