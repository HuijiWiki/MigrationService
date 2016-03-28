var bot = require('nodemw');
var async = require('async');
var config = require('../config');
var log4jsM = require('../log4js.js');
var logger = log4jsM.outLogger;
module.exports = {

	/** 
	* Register the editor client bot in huiji.wiki to fetch the editor token
	* the client needs to be passed to any futher editor functions in order 
	* to make editor functions successful.
	* 
	* @param {String} huijiDomain: a mediawiki api domain in huiji.wiki
	*/

	regiEditorOnHuiji: function(huijiDomain,callback){
		logger.info(__filename + "# start to register editor client bot in huiji.wiki");
		var client = new bot({
			server: huijiDomain,
			path: '',
			debug: false,
			concurrency: 1
		});

		client.logIn(config.bot.name, config.bot.pwd, function(err,result){
        	if(err){
			logger.error(__filename + "# fail to register editor client bot in huiji.wiki");
        		callback(err);
        	}
        	else{
			logger.info(__filename + "# success to register editor client bot in huiji.wiki");
        		callback(null, client); // pass the result from the previous function to next editor function
        	}
        
      	});
	},

	/**
	* Edit a list of articles on huiji.wiki domain. 
	* Should not be called if the bot if the bot is not registered
	* 
	* @param {nodemw object} huijiClient, a huijibot that has been registered
	* @param {[{ARTICLE: String, VALUE: String}]} contentList, a list of article's name and its content
	* @param { {String : String} } pageSpec: specification for any target position change of some pages
	* @param {String} huijiDomain: the domain where the editor will apply 
	*/
	editArticleListToHuiji: function(huijiClient, contentList, pageSpec, huijiDomain, callback){
		var editDone = 0;
		var errArray = [];
		var failNum = 0;
		logger.info(__filename + "# start to edit total " + contentList.length + " articles on huiji.wiki domain");
  		for(var i = 0; i < contentList.length; i++){
  			var pageName = contentList[i].ARTICLE;
  			var pageContent = contentList[i].VALUE;
			pageName = pageSpec[pageName]|| pageName; //update the desired target pageName
			logger.info(__filename + "# start to edit article " + pageName);
  			huijiClient.edit(pageName, pageContent, 'bot edit', function(err, result){
  				if(err){
					errArray.push({ARTICLE: this.name, ERROR: err.toString()});
  					logger.error(__filename + '# fail to edit page: ' + this.name + ' ,reason: ' + err.toString());
					failNum++;
  				}
  				editDone++;
  				if(editDone == contentList.length){
					if (errArray.length == 0){
					    errArray = null;
					    logger.info(__filename + '# success to edit all articles');
					}else{
					    logger.warn(__filename + '# fail: ' + failNum + ' , success: ' + (editDone - failNum) + ' articles');
					}
  					callback(errArray, 'SUCCESS');
  				}
  			}.bind({name:pageName}));
  		};

	},

	/**
	* Register and Created/Edit the given articleList content to huiji.wiki domain
	* 
	* @param {[{ARTICLE: String, VALUE: String}]} articleList, a list of article's name and its content
	* @param {defaultPageName : targePageName}, a dict storing pages that users want to create as targetPageName
	* @param {String} huijiDomain: the domain where the editor will apply 
	* 
	*/

	huijiArticleListEditor: function(articleList, pageSpec, huijiDomain, ediCallback){
		async.waterfall(
			[
				function(callback){
					module.exports.regiEditorOnHuiji(huijiDomain,callback);
				},
				function(huijiClient, callback){
					module.exports.editArticleListToHuiji(huijiClient, articleList, pageSpec, huijiDomain,callback);
				}
			],function(err, result){
				if(err){
					ediCallback(err);
				}
				else{
					ediCallback(null, result);
				}
			})
	}
}
