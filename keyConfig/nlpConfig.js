module.exports = {
  cortical: {
    API_KEY: '3080a0e0-0a91-11e5-a409-7159d0ac8188',
    URL: 'http://api.cortical.io:80/rest/text/keywords?retina_name=en_associative'
  },
  textRazor : {
  	API_KEY : 'e369b16f7c53f378688cec07ce0a423f6e8f6e685dd76b2859dcca66',
  	URL : 'https://api.textrazor.com',
  	EXTRACTORS :{
  		ENTITIES : 'entities',
  		TOPICS : 'topics',
  		WORDS : 'words',
  		PHRASES : 'phrases',
  		DEPENDENCYTREE : 'dependency-trees',
  		RELATIONS : 'relations',
  		ENTAILMENTS : 'entailments',
  		SENSES : 'senses'
  	},
  	RULES : 'rules_str = """ net_worth :- and( token(\'net\'), token(\'worth\'), or( topic(\'Banking\'), topic(\'Banks\'), topic(\'Financial institutions\'), topic(\'Financial services\'), topic(\'Finance\') ) ). credit_accounts :- and( token(\'credit\'), or( topic(\'Credit cards\'), topic(\'Payment cards\'), ), entity_freebase_type(\'/business/business_operation\') ). bank_accounts :- and( token(\'bank\'), or( topic(\'Banking\'), topic(\'Payment cards\'), ), entity_freebase_type(\'/business/business_operation\') ). investment_accounts :- and( stem(\'invest\'), or( topic(\'Finance\'), topic(\'Banking\'), topic(\'Investment\') ), entity_freebase_type(\'/business/business_operation\') ). insurance_accounts :- and( stem(\'insur\'), or( topic(\'Finance\'), topic(\'Banking\'), topic(\'Banks\'), topic(\'Financial institutions\'), topic(\'Investment\') ), entity_freebase_type(\'/business/business_operation\') ). transactions :- or( stem(\'transact\'), entity_freebase_type(\'/organization/organization\') ). """'
  }
};