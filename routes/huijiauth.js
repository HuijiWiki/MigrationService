
var bot = require('nodemw');
var async = require('async');
var _ = require('underscore');

module.exports = {

	serverValidate: function(req, vaCallback){
		
	},


	/**
	* Given a user's request, determine if he has the rights to perform some actions on a mediawiki Domain
	* @param {Object} req, A node.js express request object
	* @param {String} mwDomain, the mediawiki Domain that user wants to perform action on
	* @param {[String]}, defined the user groups that have the rights and permission to perform action 
	**/

	userValidate : function(req, mwDomain, givenGroups, vaCallback){
		async.waterfall([
			function(callback){
				module.exports.getRequestUserName(req,callback);
			},
			function(userName,callback){
				module.exports.getUserGroupsFromName(userName,mwDomain,callback);
			},
			function(userGroups){
				module.exports.checkGroupRights(userGroups,givenGroups,callback);
			}
			], function(err, result){
				if(err){
					vaCallback(err);
				}
				else{
					vaCallback(null, result);
				}
			});
	},
	/**
	* Get the user's information from request cookies
	* @param {String} request: the request object
	* @callback {String} Error if not valid user cookie
	*/
	getRequestUserName: function(req, callback){
		var cookie = req.cookies;
		if(cookie == undefined){ //if non of the request 
			callback('Undefined Cookie');
			return;
		}
		var huijiSession = 'huiji_session';
		var huijiUserName = cookie.get(huijiSession);
		callback(null, huijiUserName);
	},

	/**
	* Check the user's group in the mediawiki based domain
	* @param {String} userName: user's name in huiji.wiki
	* @param {String} mwDomain: a mediawiki domain site
	*/
	getUserGroupsFromName: function(userName, mwDomain, callback){
		var client = new bot({
			server: mwDomain,
			path: '',
			debug: false
		});

		 var params = {
    		action: query,
    		list:  users,
    		ususers: userName,
    		usprops: groups,
    		format: jason
  		};

  		client.api.call(params, function(err, result){
  			if(err) callback('Can Not Get User Group');
  			else callback(null, result);
  		})
	},

	/**
	* Validate whether the user is in the given user groups
	* @param {String} userGroups: groups the user is in  on mwDomain, eg ['sysop', 'bot', ...]
	* @param {String} rightGroups: groups that have the permission to perform action
	**/

	checkGroupRights: function(userGroups, givenGroups, callback){
		var hasRight =( _.intersection(userGroups, givenGroups).length > 0);
		if(!hasRight){
			callback('User Does Not Have Right For This Action');
			return;
		}
		callback(null, 'Validation Success')
	
	}
	 
}