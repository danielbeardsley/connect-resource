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
			var nextCalled = false;
			setup.middleware({url:path, method:method}, {}, function(){
				nextCalled = true;
			});
			assert.isTrue(nextCalled);
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
function testPassesToControllerForPaths(mappings){
	function passesToControllerFor(path, controllerAction){
		var parts = path.split(' '),
		method = parts[0].toUpperCase();
		path   = parts[1];
		
		return function(setup){
			setup.middleware({url:path, method:method}, {}, function(){
				setup.controller.passed.push(path);
			});
			assert.include(setup.controller.captured, controllerAction);
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
function controllerCapturer(method_list){
	var controller = {
		captured: [],
		passed: []
	};
	method_list.forEach(function(method){
		controller[method] = function(){
			controller.captured.push(method);
		}
	})
	return controller;
}

function setupControllerFor(resourceName, actions) {
	var controller = controllerCapturer(actions);
	return {
		middleware: CR.resource(resourceName, controller),
		controller: controller
	};
}
