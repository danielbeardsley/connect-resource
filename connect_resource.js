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
			var first_part = req.url.split('/',2)[1] || '/',
			controller = self.resources[first_part];
			
			if(controller){
				if(req.method == 'GET' && controller.index)
					controller.index();
				else
					next();
			} else
				next();
			
		}
	}
}

module.exports = {
	router: function(){
		return new Router();
	}
}
