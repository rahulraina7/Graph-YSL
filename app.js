var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var needle = require('needle');
var http = require('http');
var fs = require('fs');
var db = require("seraph")({
    user: 'neo4j',
    pass: 'raina88'
});

var nlpconfig = require('./keyConfig/nlpConfig');
var yodleeconfig = require('./keyConfig/yodleeConfig');
var dBase = require('./keyConfig/dBase');
var routes = require('./routes/index');
var users = require('./routes/users');
var userSessionId;
var cobrandSessionID;
var authObject;

var app = express();

//mongoose.connect('dBase/url'); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'pages')));
app.use('/', routes);
app.use('/users', users);

//creating api's for yodlee login



app.get('/api/login', function(req, res) {
    //do a post to user and cobrand login here..!!
    cobandUserLogin(function(authObject) {
        console.log("authObject : " + JSON.stringify(authObject));
        res.json(authObject);
    });
});



function cobandUserLogin(callback) {
    var uri = yodleeconfig.service_base_url + yodleeconfig.cobrand_session_token_url;
    var yodleeOptions = {
        cobrandLogin: yodleeconfig.cobrandLogin,
        cobrandPassword: yodleeconfig.cobrandPassword
    };
    needle.post(uri, yodleeOptions, function(err, yodleeResponse) {

        var response = yodleeResponse.body;
        cobrandSessionID = response.session.externalSessionID;
        var jsonHeader = "{cobSession=" + cobrandSessionID + '}';
        console.log("Done cobrand login");
        console.log(err || response);
        var authOptions = {
            headers: {
                'Authorization': "cobSession=" + cobrandSessionID + ''
            }
        };
        var userQuery = {
            userLogin: yodleeconfig.userlogin,
            userPassword: yodleeconfig.userPassword
        }; 

        var userloginUri = yodleeconfig.service_base_url + yodleeconfig.user_login_url;
        var getAccountsUri = yodleeconfig.service_base_url + yodleeconfig.get_accounts_url;
        var getTransactionsUri = yodleeconfig.service_base_url + yodleeconfig.get_transactions_url;
        needle.post(userloginUri, userQuery, authOptions, function(err, userLoginResponse) {
            console.log("Done user login");
            console.log(err || userLoginResponse.body);
            console.log(err || userLoginResponse);
            userSessionId = userLoginResponse.body.session.externalSessionID;
            authObject = {};
            authObject.userSessionId = userSessionId;
            authObject.cobrandSessionID = cobrandSessionID;
            callback(authObject);
        });
            

 

         needle.get(getAccountsUri, userQuery, authOptions, function(err, getAccountsResponse) {
            console.log("Done get accounts "); 
            console.log(err || getAccountsUri.body);
            userSessionId = getAccountsUri.body.session.externalSessionID;
            authObject = {};
            authObject.userSessionId = userSessionId;
            authObject.cobrandSessionID = cobrandSessionID;
            callback(authObject);
        });

          needle.get(getTransactionsUri, userQuery, authOptions, function(err, getTransactionsResponse) {
            console.log("Done get accounts ");
            console.log(err || getTransactionsResponse.body);
            userSessionId = getTransactionsResponse.body.session.externalSessionID;
            authObject = {};
            authObject.userSessionId = userSessionId;
            authObject.cobrandSessionID = cobrandSessionID;
            callback(authObject);
        }); 

    });

};

//creating api's for graph

app.get('/api/get', function(req, res) {
    //searchText that i get from the view
    var searchQuery = req.body.text;
    console.log("here in get api");
    res.json("{" + searchQuery + "}")
});

app.post('/api/get', function(req, res) {
    //console.log(req);
    var searchQuery = {
        q: req.body.msg
    };

    var searchQueryRazor = "text=" + searchQuery.q;
    var CORTICAL_API_KEY = nlpconfig.cortical.API_KEY;
    var CORTICAL_URL = nlpconfig.cortical.URL;
    var TEXTRAZOR_API_KEY = nlpconfig.textRazor.API_KEY;
    var TEXTRAZOR_URL = nlpconfig.textRazor.URL;
    var TEXTRAZOR_RULES = nlpconfig.textRazor.RULES;

    var options = {
        headers: {
            'api-key': CORTICAL_API_KEY,
        }
    };
    //console.log("sq" + searchQuery.q);
    var textRazorsOptions = {
        apiKey: TEXTRAZOR_API_KEY,
        text: searchQuery.q,
        extractors: 'entities,words,phrases,relations'
            //rules : TEXTRAZOR_RULES
    };


    //console.log("here in post ");
    if (!req.body) {
        return res.send(400);
    }
    //console.log(req.body.msg);


    // -------------------------KeyWord Extraction call ----------------------------
    /*needle.post(CORTICAL_URL,searchQuery,options,function(err,corticalResponse){
      console.log(err || corticalResponse.body);
    }); */

    // -------------------------Mo0re API call's to Cortical goes Here--------------
    //console.log('data : '+data);
    var razorResponseObject;
    var extractionObject;
    needle.post(TEXTRAZOR_URL, textRazorsOptions, function(err, razorResponse) {
        console.log(JSON.stringify(razorResponse.body, null, 2));
        //console.log(err || razorResponse.body);
        //come and fix npe for this.. !!
        razorResponseObject = razorResponse.body;
        var nounPhrases = razorResponseObject.response.nounPhrases;
        var entities = razorResponseObject.response.entities;
        var words = razorResponseObject.response.sentences[0].words;
        var phraseArray = [];
        var predicateArray = [];
        var propertyArray = [];
        var entityArray = [];
        if (entities != null) {
            entities.forEach(function(entityEntry) {
                console.log("Entity found : " + entityEntry.entityId);
                entityArray.push(entityEntry.entityId.trim().toLowerCase());
            });
        }
        if (nounPhrases != null) {

            if (nounPhrases && nounPhrases.length > 0) {
                nounPhrases.forEach(function(entry) {
                    var phrase = "";
                    if (entry.wordPositions.length > 1) {
                        entry.wordPositions.forEach(function(wordEntry) {
                            phrase = phrase + words[wordEntry].token + " ";
                        });
                    } else {
                        phrase = words[entry.wordPositions].token;
                    }
                    console.log('phrase is : ' + phrase.trim());
                    phraseArray.push(phrase.trim().toLowerCase());
                });
            }
        }
        var predicateObject = razorResponseObject.response.properties;
        if (predicateObject != null) {

            if (predicateObject && predicateObject.length > 0) {
                predicateObject.forEach(function(predicateEntry) {
                    var predicate = "";
                    var property = "";
                    if (predicateEntry.wordPositions.length > 1) {
                        predicateEntry.wordPositions.forEach(function(wordEntry) {
                            predicate = predicate + words[wordEntry].token + " @stem:" + words[wordEntry].stem;
                        });
                        predicateEntry.propertyPositions.forEach(function(wordEntry) {
                            property = property + words[wordEntry].token + " @stem:" + words[wordEntry].stem;
                        });
                    } else {
                        predicate = words[predicateEntry.wordPositions].token + " @stem:" + words[predicateEntry.wordPositions].stem;
                        property = words[predicateEntry.propertyPositions].token + " @stem:" + words[predicateEntry.propertyPositions].stem;
                    }

                    console.log('predicate is : ' + predicate.trim());
                    console.log('property is : ' + property.trim());
                    predicateArray.push(predicate.trim().toLowerCase());
                    propertyArray.push(property.trim().toLowerCase());
                });
            }
        }

        console.log('Phrase Array : ' + phraseArray);
        console.log('Predicate Array : ' + predicateArray);
        console.log('Property Array : ' + propertyArray);
        console.log('Entity Array : ' + entityArray);
        var asset_query = false;
        var liability_query = false;
        var total_assets = false;
        var total_liabilities = false;
        var all_accounts = false;
        var container_accounts = false;
        var spending_in_category = false;
        var trans_base_type = false;
        var transaction_at_merchant = false;
        console.log("entering predicateArray");
         predicateArray.forEach(function(foo) {
          console.log("foo : " +  foo);
          if(foo.indexOf("asset") > -1){
              console.log(true);
              console.log(propertyArray.indexOf("total @stem:total"));
          }
         });

        predicateArray.forEach(function(foo) { 
            if (foo.indexOf("asset") > -1 && propertyArray.indexOf("total @stem:total") > -1) {
              console.log("total_assets : " + total_assets); 
                total_assets = true;
            } else if (foo.indexOf("@stem:liabil") > -1 && propertyArray.indexOf("total @stem:total") > -1) {
                console.log("total_liabilities : " + total_liabilities);
                total_liabilities = true;
            } else if (propertyArray.indexOf("asset") > -1) {
                              console.log("asset_query : " + asset_query);
                            asset_query = true;
            } else if (propertyArray.indexOf("liabil") > -1) {
                console.log("liability_query : " + liability_query);
                liability_query = true;
            }
        });

        phraseArray.forEach(function(foo) {
            if (foo.indexOf("all") > -1 && foo.indexOf("account") > -1 && !total_assets && !total_liabilities && !asset_query && !liability_query) {
                all_accounts = true;
            }
        });
        var container_param;
        entityArray.forEach(function(foo1) {
            if (foo1.indexOf("credit card") > -1) {
                phraseArray.forEach(function(foo2) {
                    if (foo2.indexOf("account") > -1) {
                        console.log("I am here..!!")
                        container_accounts = true;
                        container_param = "creditCard";
                        return;
                    }
                });
            } else if (foo1.indexOf("bank account") > -1) {
                phraseArray.forEach(function(foo2) {
                    if (foo2.indexOf("account") > -1) {
                        console.log(" foo2 I am here..!!")
                        container_accounts = true;
                        container_param = "bank";
                        return;
                    }
                });
            }
        });


        var merchant_param;
        predicateArray.forEach(function(foo1) {
            if (foo1.indexOf("at") > 0) {
                if (entityArray.length > 0) {
                    transaction_at_merchant = true;
                    merchant_param = entityArray[0].substring(0, propertyArray[0].indexOf(" @"));
                    console.log(" merchant_param : " + merchant_param);
                } else {
                    transaction_at_merchant = true;
                    merchant_param = propertyArray[0].substring(0, propertyArray[0].indexOf(" @"));
                    console.log(" merchant_param : " + merchant_param);
                }
            }
        });
        var dBaseQuery;

        console.log("Here going to execute query on Graph DB");
        if (asset_query) {
            dBaseQuery = 'MATCH (account:Account)-[r:IS_ASSET]->(asset:Asset) where asset.name=\'TRUE\' RETURN r';
        } else if (liability_query) {
            dBaseQuery = 'MATCH (account:Account)-[r:IS_ASSET]->(asset:Asset)  where asset.name=\'FALSE\'  RETURN r';
        } else if (total_assets) {
            console.log("here in total assets");
            dBaseQuery = 'MATCH (account:Account)-[r:IS_ASSET]->(asset:Asset)  WHERE asset.name=\'TRUE\' RETURN sum(toFloat(account.balance))';
        } else if (total_liabilities) {
            dBaseQuery = 'MATCH (account:Account)-[r:IS_ASSET]->(asset:Asset)  WHERE asset.name=\'FALSE\' RETURN sum(toFloat(account.balance))';
        } else if (all_accounts) {
            console.log("going to execute this query all_accounts");
            dBaseQuery = 'MATCH (account:Account)-[r:ACCOUNTS_IN]->(provider:ProviderName) RETURN provider';
        } else if (container_accounts) {
            console.log("going to execute this query");
            dBaseQuery = 'MATCH (account:Account)-[r:ACCOUNT_TYPE]->(container:Container) WHERE container.name =~ \'(?i).*' + container_param + '.*\' RETURN account';
        } else if (transaction_at_merchant) {
            dBaseQuery = 'MATCH (transaction:Transaction)-[r:TRANSACTED_AT]->(merchantName:MerchantName) where merchantName.name =~ \'(?i).*' + merchant_param + '.*\' RETURN transaction';
        }

        var graphResultArray =[];
        var graphResultObject = {};
        db.query(dBaseQuery, function(gerr, gresult) {
            if (gerr) {
                console.log("error : " + gerr);
            } else {
                console.log("graph result : ");
                gresult.forEach(function(oEntry) {
                    graphResultArray.push(oEntry);
                    console.log("graphResultArray : "+graphResultArray);
                    console.log(JSON.stringify(oEntry));
                });
            }
          graphResultObject.result=graphResultArray;
          console.log("graphResultObject : " + JSON.stringify(graphResultObject));      
          res.json(err || graphResultObject);
        });



        /*console.log("------Noun Phrases---------");
        console.log(JSON.stringify(nounPhrases, null, 2));
*/
    });



});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});




module.exports = app;