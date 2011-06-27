var vows = require('vows'),
assert = require('assert'),
CR = require('./connect_resource');

vows.describe('connect-resource').addBatch({
	'A Resource with no methods': {
		topic: setupControllerFor('things', []),
		
		'should call next() for all url paths': testPathActionMappings({
			'get /'                : null,
			'get /blah'            : null,
			'get /things/1'        : null,
			'get /things/1/edit'   : null,
			'post /'               : null,
			'pust /things/1'       : null,
			'delete /things/1'     : null
		})
	},
	
	'A Resource with the default set of methods': {
		topic: setupControllerFor('things', "index show new create update delete".split(' ')),
		
		'should send requests to the right places': testPathActionMappings({
			'get /things'                : 'index',
			'get /things/blah'           : null,
			
			'get /things/'               : null,
			'put /things'                : null,
			'post /things'               : null,
			'delete /things'             : null,
			
			'put /things/blah'           : null,
			'put /things/blah'           : null,
		})
	}	
}).export(module);


// Returns a Context that tests the parent topic to ensure requests are routed
// as specified by `mappings`
// mappings = {
//	'get /blah'           : 'action_name'
//	'get /not_a_resource' : null  // tests if the request is passed to next()
// }
//
function testPathActionMappings(mappings){
	function passesRequestTo(path, action){
		var parts = path.split(' '),
		method = parts[0].toUpperCase();
		path   = parts[1];
		
		return function(setup){
			var passed = [];
			setup.controller.captured = [];
			setup.middleware({url:path, method:method}, {}, function(){
				passed.push(path);
			});
			
			if(action){
				// assert the request was passed to the correct controller action
				assert.deepEqual(setup.controller.captured, [action]);
				
				// assert the request was NOT passed on to next()
				assert.isEmpty(passed);
			} else {
				// assert the request was NOT passed to the controller
				assert.isEmpty(setup.controller.captured);
				
				// assert the request was passed on to next()
				assert.deepEqual(passed, [path]);
			}
		}
	}
	
	var context = {
		topic: function(middleware){
			return middleware;
		}
	}
	
	for(var path in mappings){
		var action = mappings[path],
		vow_function = passesRequestTo(path, action),
		vow_name;
		
		if(action == null)
			vow_name = 'should pass the request "' + path +'" to next()';
		else
			vow_name = 'should pass the request "' + path +'" to the controller action: ' + action;
		
		context[vow_name] = vow_function;
	}
	
	return context;
}

// Returns an object with a function stored in each of the properties specified.
// A list of which functions have been called is kept in .captured
//
function capturingController(method_list){
	var controller = {
		captured: []
	};
	method_list.forEach(function(method){
		controller[method] = function(){
			controller.captured.push(method);
		}
	})
	return controller;
}

// Creates a connect-resource router and adds a resource using a capturing
// controller which exposes the specified actions
//
function setupControllerFor(resourceName, actions) {
	var controller = capturingController(actions);
	var router = CR.router();
	router.resource(resourceName, controller);
	
	return {
		middleware: router.middleware,
		controller: controller
	};
}
