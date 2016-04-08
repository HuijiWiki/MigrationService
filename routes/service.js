var express = require('express');
var crypto = require('crypto')
//var bot = require('nodemw');
var config = require('../config');
var cookies =  require('cookies');
var router = express.Router();
var async = require('async');
var _ = require('underscore');
var log4jsM = require('../log4js.js');
var logger = log4jsM.outLogger;

var pm = require('./pagemigrator');
var sm = require('./skeletonmigrator');

var bot  = require('../huijiBOT/bot');


/**
* TODO: Add authentication middleware 
*/

router.post('/t', function(req,res){

	var cb = function(err , result){
		if(err){
			res.send(err);
		}else{
			res.send(result);
		}
	};
	
		

	var client = new bot({
			siteDomain: 'zhang01.huiji.wiki',
			path: '/'
		   });
	
//	client.login(config.bot.name,config.bot.pwd,cb);
	
//	client.edit("首页","dfdf","","993129e7cb075f61345028874eef269d56fe7487",cb);
	client.getToken(cb);
	


});


router.post('/s', function(req,res){

        var cb = function(err , result){
                if(err){
                        res.send(err);
                }else{
                        res.send(result);
                }
        };



        var client = new bot({
                        siteDomain: 'zhang01.huiji.wiki',
                        path: '/'
                   });

      client.login(config.bot.name,config.bot.pwd,cb);

//      client.edit("首页","dfdf","","993129e7cb075f61345028874eef269d56fe7487",cb);
//        client.getToken(cb);



});




/**
* Node.js based crawler and editor service endpoint. 
* 
* Sample usage query: huiji.wiki:PORT/pm?page=Test_Target_Page&fromDomain=test.wikia.com&toDomain=test.hiuji.wiki&jobType=1
* 
* Parameters Required:
*   page: String, The target page that user wants to transfer
*   fromDomain: String, the domain where the page exists and the user wants to transfer from
*   toDomain: String, the huiji.wiki domain that user wants to transfer the page to
*   jobType : Int, 1 if it's a (wikia, huiji) ->huiji transfer, 2 if it's a huiji template manager -> huiji transfer
*                  3 if it's wiki skeleton transfer. 
* Errors: 
*   Parameter Undefined Error
*   ToDomain Not Valid Error
*   FromDomain Not Valid Error
*   BOT Error 
*   Tempalte Crawl Error
*   Content Crawl Error
*   Crawl Error
*   Edit Register Error
*   Edit Error
*
* Return Value:
*   SUCCUSS, if all the process completed
*   Errors defined above if any procedure encounters an error. 
**/


router.post('/pm', function(req,res){
  var page       = req.query.page;
  var fromDomain = req.query.fromDomain;
  var toDomain   = req.query.toDomain;

  if(page == undefined || fromDomain == undefined || toDomain == undefined ){
    res.send('Parameter Undefined Error');
  }

  pm.migrateSinglePage(page, fromDomain,toDomain, {}, function(err, result){
    if(err){
      res.send(err);
    }
    else{
      res.send(result);
    }
  });

});


/**
 * Node.js based skeleton crawler and editor service endpoint
 * Function: to migrate main wikipages from wikia to huiji
 * usage query: www.huiji.wiki:PORT/mm?fromDomain=xxx.wikia.com&targetDomain=xxx.huiji.wiki
 * fromDomain: the domain where to copy main page
 * targetDomain: the domain to copy the sketeon from
 */

router.post('/mm', function(req,res){
  var fromDomain = req.query.fromDomain;
  var targetDomain   = req.query.targetDomain;

  if( fromDomain == undefined || targetDomain == undefined ){
    res.send({status:'fail',message:'Parameter Undefined Error'});
    return;
  }

  pm.migrateMainPage(fromDomain, targetDomain, function(err, result){
    if(err){
      res.send({status:'fail',message:err.toString()});
    }
    else{
      res.send({status:'success',message:'Main Page Migrate Sucess'});
    }
  });

});

 /**
 * Node.js based skeleton crawler and eidtor service endpoint
 * 
 * Sample usage query: huiji.wiki:PORT/sm(p/n)?fromSkeletonWbsite=xxx.wikia.com&toSkeletonWebsite=test.huiji.wiki&skeleton=Mediawiki:
 * Parameter Required: 
 *   fromDomain: the domain where to copy the skeleton from
 *   targetDomain: the domain to copy the template to
 *   skeletonName: the name for the skeleton.
 *       eg. For navigation bar of a wikia website, the skeleton name will be : Mediawiki:wiki-navigation
 *           For huiji.wiki based website, the skeleton is managed under Manifesto  namespace. 
 */

router.post('/smp', function(req,res){ 
  logger.info("Request: " + req.originalUrl);
  var fromDomain = req.query.fromDomain||'templatemanager.huiji.wiki';
  var targetDomain = req.query.targetDomain;
  var skeletonName = req.query.skeletonName;

  logger.info(__filename + "# Start to install huiji package : " + skeletonName + " to wikisite :  " + targetDomain);
 
    sm.installHuijiPackage(fromDomain, targetDomain, skeletonName,function(err, result){
     if(err){
	logger.error(__filename + "# Fail to install huiji package, reason: " + err.toString() + ".");
      res.send({message: err.toString(),
		status:"fail" });
     }else{
	logger.info(__filename + "# Success to install huiji package to wikisite: " + targetDomain);
       res.send({status: "success",
		 message: "Migrate huiji templates successfully"});
     }
    });
});

router.post('/nvp', function(req, res){
  var fromDomain = req.query.fromDomain;
  var targetDomain = req.query.targetDomain;
  res.send('please wait');

  sm.installWikiaNav(fromDomain, targetDomain,function(err, result){
    if(err){
      console.log(err);
    }
    else{
      console.log(result);
    }
  })
});








module.exports = router;
