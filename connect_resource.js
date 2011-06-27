module.exports = {
	resource: function(){
		return function(req, res, next){
			next();
		}
	}
}
