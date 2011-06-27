var vows = require('vows'),
assert = require('assert'),
CR = require('./connect_resource');

vows.describe('connect-resource').addBatch({
	'A Resource with no methods': {
		topic: setupControllerFor('things', []),
		
		'should call next() for all url paths': testPassesToNextForPaths([
			'get /',
			'get /blah',
			'get /things/1',
			'get /things/1/edit',
			'post /',
			'pust /things/1',
			'delete /things/1'
		])
	},
	
	'A Resource with just the index method': {
		topic: setupControllerFor('things', ['index']),
		
		'should pass the request to the controller': testPassesToControllerForPaths({
			'get /things': 'index'
		})
	}	
}).export(module);

function testPassesToNextForPaths(paths){
	function passesToNextFor(path){
		var parts = path.split(' '),
		method = parts[0].toUpperCase();
		path   = parts[1];
		
		return function(setup){
			var passed = [];
			setup.middleware({url:path, method:method}, {}, function(){
				passed.push(path);
			});
			
			// assert the request was NOT passed to the controller
			assert.isEmpty(setup.controller.captured);
			
			// assert the request was passed on to next()
			assert.deepEqual(passed, [path]);
		}
	}
	
	var context = {
		topic: function(middleware){
			return middleware;
		}
	}
	
	paths.forEach(function(path){
		context['should call next() for ' + path] = passesToNextFor(path)
	});
	
	return context;
}

// Returns a Context that tests if the request is passed to a controller for
// each of the listed mappings.
// mappings = {
//	'get /blah': 'action_name'
// }
//
function testPassesToControllerForPaths(mappings){
	function passesToControllerFor(path, controllerAction){
		var parts = path.split(' '),
		method = parts[0].toUpperCase();
		path   = parts[1];
		
		return function(setup){
			var passed = [];
			setup.middleware({url:path, method:method}, {}, function(){
				passed.push(path);
			});
			
			// assert the request was passed to the correct controller action
			assert.deepEqual(setup.controller.captured, [controllerAction]);
			
			// assert the request was NOT passed on to next()
			assert.isEmpty(passed);
		}
	}
	
	var context = {
		topic: function(middleware){
			return middleware;
		}
	}
	
	for(var path in mappings){
		var action = mappings[path]; 
		context['should pass the request "' + path +'" to the controller action: ' + action] =
			passesToControllerFor(path, action);
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
