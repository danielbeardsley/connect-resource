var vows = require('vows'),
assert = require('assert'),
CR = require('./connect_resource');

vows.describe('Resources').addBatch({
	'A Resource with no methods': {
		topic: function () {
			return CR.resource('things', {});
		},
		
		'should call next() for all url paths': testPassestoNextForPaths([
			'get /',
			'get /blah',
			'get /things/1',
			'get /things/1/edit',
			'post /',
			'pust /things/1',
			'delete /things/1'
		])
	}
}).export(module);

function testPassestoNextForPaths(paths){
	function passesToNextFor(path){
		var parts = path.split(' '),
		method = parts[0].toUpperCase();
		path   = parts[1];
		
		return function(middleware){
			var nextCalled = false;
			middleware({url:path, method:method}, {}, function(){
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
