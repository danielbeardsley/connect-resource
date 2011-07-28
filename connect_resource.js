function Router(){
	this.resources = {};
	this.middleware = this._createMiddleware();
}

Router.prototype = {
	resource: function(name, controller){
		this.resources[name] = controller;
	},
	
	_createMiddleware: function(){
		var self = this;
		return function(req, res, next){
			// "/resource_name/blah"
			var first_part = consumeUrlPart(req),
			action = req._parts[0];
			partsLeft = req._parts.length;
			controller = self.resources[first_part];
			
			if(controller){
				var method = req.method;
				switch(req.method){
					case 'GET':
						if(action == null && controller.index)
							return controller.index.apply(null, arguments);
						else if(action == null && controller.index)
						break;
				}
				next();
			} else
				next();
			
		}
	}
}

function consumeUrlPart(req){
	if(!req._parts){
		var url = req.url.substr(1),
		query_index = req.url.indexOf('?');
		
		if(query_index >= 0)
			url = url.substr(0, query_index);
		
		req._parts = url.split('/');
	}
	return req._parts.length > 0 ? req._parts.shift() : null
}

module.exports = {
	router: function(){
		return new Router();
	}
}
