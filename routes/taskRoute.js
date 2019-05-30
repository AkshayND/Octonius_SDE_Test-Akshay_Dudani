var express = require('express');
var multer = require('multer');
var fs = require('fs-extra');
var router = express.Router();
var User = require('../models/user');
var Task = require('../models/task');
var path = require('path');

var DIR = path.join(__dirname,'../uploads/');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
        var fileName = file.originalname.split('.')[0];
        cb(null, fileName + '-' + Date.now());
    }
});
var upload = multer({storage: storage});
// var upload = multer({ dest: 'uploads/' });
console.log(path.join(__dirname,'../uploads/'));

router.get('/', function(req, res, next) {
    var userId = req.query.userId;
    var searchText = req.query.searchText;
    if(searchText == undefined){
        console.log('Getting the Tasks for User with UserId ' + userId);
        Task.find({user: userId})
            .exec(function (err, tasks) {
                if(err){
                    return res.status(500).json({
                        title: 'An Error Occured while Finding Tasks!',
                        error: err
                    });
                }
                return res.status(201).json({
                    message: 'Got Tasks!!!!!',
                    object: tasks
                });
            });
    }
    else{
        console.log('Getting the Tasks for User with UserId ' + userId);
        Task.find({user: userId, $or: [{heading: {$regex: ".*" + searchText + ".*"}},{content: {$regex: ".*" + searchText + ".*"}}]})
            .exec(function (err, tasks) {
                if(err){
                    return res.status(500).json({
                        title: 'An Error Occured while Finding Tasks!',
                        error: err
                    });
                }
                return res.status(201).json({
                    message: 'Got Tasks!!!!!',
                    object: tasks
                });
            });
    }
    
});

router.get('/:heading', function (req, res, next) {
	var heading = req.params.heading;
	var validate = req.query.validate;
    var userId = req.query.userId;
	if(validate != undefined){
		console.log('Validating the Task heading ' + heading + ' & UserId ' + userId + ' to be present!');
		Task.findOne({heading: heading, user: userId}, 'heading', function (err, task) {
			if(err){
				return res.status(500).json({
					title: 'An Error Occured while Finding Task!',
					error: err
				});
			}
			return res.status(201).json({
				message: 'Got a Task!!!!!',
				object: task
			});
		});
	}
	else{
    console.log('Getting the Task with heading ' + heading + ' & UserId ' + userId);
    Task.findOne({heading: heading, user: userId})
        .exec(function (err, task) {
            if(err){
                return res.status(500).json({
                    title: 'An Error Occured while Finding Task!',
                    error: err
                });
            }
            return res.status(201).json({
                message: 'Got a Task!!!!!',
                object: task
            });
        });
	}
});

router.post('/', function (req,res,next) {
    console.log('Adding New Task');
    var body = req.body;
    var userId = body.user;
    console.log(body);
    User.findById(userId, function (err, user){
        if(err){
            return res.status(500).json({
                title: 'An Error Occured while Adding Task!',
                error: err
            });
        }
        console.log(user);
        if( user == null ){
            return res.status(500).json({
                title: 'User doesn\'t Exists!',
                error: {
                  message: 'User with ' + userId + ' does not exists! You cant add task!' 
                }
            });
        }
        Task.findOne({heading: body.heading, user: userId}, function (err, task){
            if(err){
                return res.status(500).json({
                    title: 'An Error Occured while Adding Task!',
                    error: err
                });
            }
            if( task != null ){
                return res.status(500).json({
                    title: 'Task already Exists!',
                    error: {
                      message: 'Task: ' + body.heading + ' already exists! You cant add duplicate!' 
                    }
                });
            }
            var newTask = new Task({
                heading:    body.heading,
                content:    body.content,
                date:       body.date,
                user:       userId,
                completed:  body.completed
            });
            console.log(newTask);
            newTask.save(function(err, savedTask){
                if(err){
                    return res.status(500).json({
                        title: 'An Error Occured while Adding Task!',
                        error: err
                    });
                }
                console.log(savedTask);
                user.tasks.push(savedTask);
                user.save();
                res.status(201).json({
                    message: 'Successfully inserted Task',
                    object: savedTask
                });
            });
        });
    });
});


router.post('/uploadImage', upload.single('myImage'), function (req,res,next) {
    console.log('Inserting New Image');
    var taskId = req.query.taskId;
    console.log(taskId);
    if(!req.file){
        return res.status(500).json({
            title: 'An Error Occured while Adding Image!',
            error: 'No File Found!'
        });
    }
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    // Define a JSONobject for the image attributes for saving to database
    console.log(req.file); 
    var finalImg = {
         contentType: req.file.mimetype,
         image:  new Buffer.from(encode_image, 'base64')
      };
    console.log(finalImg);
    if(taskId != undefined){
        Task.findById(taskId, function(err, task){
            if(err){
                return res.status(500).json({
                    title: 'An Error Occured while Adding Image!',
                    error: err
                });
            }
            console.log(typeof(finalImg));
            if(task != null){
                task.image = finalImg;
                task.savedImageName = req.file.filename;
                task.save();
                res.status(201).json({
                    message: 'Successfully uploaded image & Updated Task',
                    object: task
                });
            }
        })
    }
    else {
        res.status(201).json({
            message: 'Successfully uploaded Image',
            object: {
                image: finalImg,
                savedImageName: req.file.filename
            }
        });
    }

});


router.patch('/:id', function(req, res, next){

	var taskId = req.params.id;
	var updatedTask = req.body;

	console.log('Update Task of id ' + taskId);

	Task.findByIdAndUpdate(taskId, updatedTask, function (err, task) {
		if(err){
			return res.status(500).json({
				title: 'An Error Occured while Updating Task!',
				error: err
			});
		}
		res.status(201).json({
			message: 'Successfully Updated Task!',
			object: task
		});
	});
	
});

router.delete('/:taskId', function(req, res, next) {
    var taskId = req.params.taskId;
    var userId = req.query.userId;
    
    Task.findByIdAndDelete(taskId,function(err, task){
        if(err){
			return res.status(500).json({
				title: 'An error has occurred while Deleting Task!',
				error: err
			});
        }
        if(task == null){
            return res.status(500).json({
				title: 'Task doesn\'t Exists!',
				error: {
					message: 'Task with id: ' + taskId + ' does not exists!!' 
				}
			});
        }
        User.findById(userId, function(err, user){
            if(err){
                return res.status(500).json({
                    title: 'An error has occurred while Deleting Task!',
                    error: err
                });
            }
            if(user == null){
                return res.status(500).json({
                    title: 'User doesn\'t Exists!',
                    error: {
                        message: 'User with id: ' + taskId + ' does not exists!!' 
                    }
                });
            }
            user.tasks.pull(taskId);
            user.save();
            console.log(task.savedImageName);
            fs.remove(DIR + task.savedImageName , err => {
                console.log(err);
                if(err){
                    return res.status(500).json({
                        title: 'File Wasn\'t deleted',
                        error: {
                            message: err
                        }
                    });
                }
                res.status(200).json({
                    message: 'Successfully Deleted Task',
                    object: task
                });
            });
        });
    });
});

module.exports = router;
