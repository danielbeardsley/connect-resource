module.exports = {
	resource: function(name, controller){
		return function(req, res, next){
			if(req.url == '/' + name && req.method == 'GET')
				controller.index();
			else
				next();
		}
	}
}
