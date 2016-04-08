var bot = require('../huijiBOT/bot');
var async = require('async');
var config = require('../config');
var log4jsM = require('../log4js.js');
var logger = log4jsM.outLogger;

var Fiber = require('fibers');


module.exports = {

	/** 
	* Register the editor client bot in huiji.wiki to fetch the editor token
	* the client needs to be passed to any futher editor functions in order 
	* to make editor functions successful.
	* 
	* @param {String} huijiDomain: a mediawiki api domain in huiji.wiki
	*/
	

	regiEditorOnHuiji: function(client,callback){
		logger.info(__filename + "# start to register editor client bot in huiji.wiki");
		client.login(config.bot.name, config.bot.pwd, function(err,result){
        	if(err){
			logger.error(__filename + "# fail to register editor client bot in huiji.wiki, reason: " + err.toString() );
        		callback(err.toString());
        	}
        	else{
			logger.info(__filename + "# success to register editor client bot in huiji.wiki");
        		callback(null, result); // pass the result from the previous function to next editor function
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
	
	editArticleListToHuiji: function(huijiClient, contentList, pageSpec, retryNumber, callback){


		//console.log("RETRY:" + retryNumber );
		if(contentList == null || contentList.length == 0) {
			callback(null, 'SUCCESS');
			return;
		}
		var editDone = 0;
		var errArray = [];
		var failNum = 0;
		var errList = []; 
		logger.info(__filename + "# start to edit total " + contentList.length + " articles on huiji.wiki domain");
  		for(var i = 0; i < contentList.length; i++){
  			var pageName = contentList[i].ARTICLE;
  			var pageContent = contentList[i].VALUE;
			pageName = pageSpec[pageName]|| pageName; //update the desired target pageName
			logger.info(__filename + "# start to edit article " + pageName);
  			huijiClient.edit(pageName, pageContent, 'bot edit', function(err, result){
  				if(err || JSON.parse(result).error != null){
					errList.push({ARTICLE:this.name, VALUE:this.content});
					var errM = (err != null) ? err.toString():result.toString();
					errArray.push({ARTICLE: this.name, ERROR: errM});
  					logger.error(__filename + '# fail to edit page: ' + this.name + ' ,reason: ' + errM);
					failNum++;
  				}
  				editDone++;
				//console.log(contentList.length + " ---  " + editDone);
  				if(editDone == contentList.length){
					if (errArray.length == 0){
					    logger.info(__filename + '# success to edit all articles');
					    callback(null, 'SUCCESS');
					}else if(retryNumber <= 0){
					    logger.warn(__filename + '# fail: ' + failNum + ' , success: ' + (editDone - failNum) + ' articles');	
					    callback(errArray);
					    return;
					}else{
					    logger.warn(__filename + '# fail: ' + failNum + ' , success: ' + (editDone - failNum) + ' articles');
					    module.exports.editArticleListToHuiji(huijiClient, errList, pageSpec, retryNumber-1, callback);
					    return;
					}
  				} 
 			}.bind({name:pageName, content:pageContent}));
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

		console.log(huijiDomain);	
		var huijiClient = new bot({
			siteDomain: huijiDomain,
                        path: '/'	
		});

		async.waterfall(
			[
				function(callback){
					module.exports.regiEditorOnHuiji(huijiClient,callback);
				},
				function(out, callback){
					
					module.exports.editArticleListToHuiji(huijiClient, articleList, pageSpec , 4 ,callback);
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
