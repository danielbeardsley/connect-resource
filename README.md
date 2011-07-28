## Notice ##
This project is in the early stages, feel free to contribute.

## Connect-Resource ##
A simple middleware for connect or express that enables easy and lightweight
resource based routing.

### Usage ###
		var connect_resource = require('connect-resource'),
		router = connect_resource.router(),
		connect = require('connect');
		
		var controller = {
			index: function(req, res, next){
				// ... respond to index action at url "GET prefix/"
			},
			
			show: function(req, res, next){
				// ... respond to show action  at url "GET prefix/id"
			}
			
			// ...
		}

		// register our controller with the resource name "users"
		router.resource('users', controller);
		
		// Place the middleware in the stack.		
		connect.use(router.middleware);
