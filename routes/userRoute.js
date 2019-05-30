var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');

/* GET users listing. */

router.get('/:username', function (req, res, next) {
	var username = req.params.username;
	var validate = req.query.validate;
	if(validate != undefined){
		console.log('Validating the User username ' + username + ' to be present!');
		User.findOne({username: username}, 'username', function (err, user) {
			if(err){
				return res.status(500).json({
					title: 'An Error Occured while Finding User!',
					error: err
				});
			}
			return res.status(201).json({
				message: 'Got a User!!!!!',
				object: user
			});
		});
	}
	else{
		console.log('Getting the User with username ' + username);
    User.findOne({username: username})
      .populate('tasks')
			.exec(function (err, user) {
				if(err){
					return res.status(500).json({
						title: 'An Error Occured while Finding User!',
						error: err
					});
				}
				return res.status(201).json({
					message: 'Got a User!!!!!',
					object: user
				});
			});
	}
});

router.post('/', function(req, res, next) {
	console.log('Signing up the User Account!');
	var username = req.body.username;
	User.findOne({username: username})
		.exec(function (err, obj) {
    if(err){
      return res.status(500).json({
        title: 'An Error Occured while Finding User!',
        error: err
      });
    }
    if(obj != null){
      // user already exists
      return res.status(500).json({
        title: 'User already Exists!',
        error: {
          message: req.body.username + ' already exists! You cant add duplicate!' 
        }
      });	
    }   
    var user = new User({
      name:       req.body.name,
      email:      req.body.email,
      tasks:      [],
      username:   req.body.username,
      password: 	bcrypt.hashSync(req.body.password, 10)
    });
    user.save(function(err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An Error Occured while Signing Up!',
          error: err
        });
      }
      console.log(user);
      res.status(201).json({
        message: 'Successfully Registered! Thanks!!!!!',
        object: result
      });
    });
  });
});

router.post('/signin', function(req, res, next) {
	console.log('Logging The User!');
	User.findOne({$or: [{username: req.body.username}, {email: req.body.username}]}, function (err, user) {
		if (err) {
			return res.status(500).json({
				title: 'An Error Occured while Signing In!',
				error: err
			});
		}
		if(!user){
			return res.status(401).json({
				title: 'Login Failed!',
				error: {message: 'Invalid Login Credientials!!'}
			});
		}
		if(!bcrypt.compareSync(req.body.password, user.password)){
			return res.status(401).json({
				title: 'Login Failed!',
				error: {message: 'Invalid Login Credientials!!'}
			});
		}		
		var token = jwt.sign({user: user}, 'secret', {expiresIn: 7200});
		res.status(200).json({
			message: 'Successfully Logged In!!!',
			token: token,
			userId: user._id,
			userUsername: user.username
		});
	});
});

module.exports = router;
