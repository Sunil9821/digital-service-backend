const express = require('express');
const connection = require('./database');
const jwt = require('./jwt');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../uploads/');
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        // cb(null, file.originalname.split('.')[0] + path.extname(file.originalname));
        cb(null, file.originalname);
    }
  });
// const uploads = multer({dest: './uploads'})
const uploads = multer({storage: storage})

const router = express.Router();



router.get('/', (req,res)=>{
    res.send('Welocome to Digital Services')
})

// router.get('/checkUsernameExist', (req,res)=>{    
    // console.log(req.query.username);
router.get('/checkUsernameExist/:username', (req,res)=>{
    console.log(req.params.username);
    let sql =  `select * from login where username='${req.params.username}'`;
    console.log(sql);
    connection.query(sql, (err2, res2)=>{
        if(res2.length>0){
            res.status(200).json({'userExist':true});
        }else if(res2.length==0){
            res.status(200).json({'userExist':false});
        }
    })
})

router.post('/login', (req,res)=>{
    console.log(req.body);
    let body = req.body;
    let sql = `select * from login where username='${body.username}' and password='${body.password}'`;
    console.log(sql);

    connection.query(sql, (err,res2)=>{
        if(err){
            res.status(500).json({'status':'failed', 'message':'no user found'});
        }else{
            console.log(res2.length)
            if(res2.length == 0){
                res.status(500).json({'status':'failed', 'message':'no user found'});   
            }else if(res2.length>0){
                let token = jwt.generateToken(body.username);
                if(res2[0]['role']=='admin'){
                    res.status(200).json({'status':'success', 'message':'login sucessful', 'token':token, 'role':res2[0]['role']});
                }else{
                    let sql1 = `select * from employeedata where username='${body.username}'`;
                    connection.query(sql1, (err3, res3)=>{
                        if(err){
                            res.status(200).json({'status':'success', 'message':'login sucessful', 'token':token, 'role':res2[0]['role']});
                        }else if(res3.length>0){
                            res.status(200).json({'status':'success', 'message':'login sucessful', 'token':token, 'data':res3[0], 'role':res2[0]['role']});
                        }
                    })
                }                
            }
        }
    })
})


// Employee
router.get('/getAllEmployees', jwt.validateToken, (req, res)=>{  
    console.log('getEmployee');
    // console.log(req.headers)
    let sql = `select * from employeedata`;
    connection.query(sql, (err,res2)=>{
        // console.log('validate');
        if(err){
            res.status(500).json({'status':'failed', 'message':'server error'});
        }else{
            if(res2.length==0){
                res.status(200).json({'status':'success', 'message':'no data available', 'data':[]});
            }else if(res2.length>0){
                res.status(200).json({'status':'success', 'message':'data found', 'data':res2});
            }
        }
    })
})

router.get('/getAllEmployees', jwt.validateToken, (req, res)=>{  
    console.log('getAllEmployees');
    let body = req.query;
    let offset = (body.page-1)*body.limit;
    let limit = body.limit;
    // let sql = `select * from employeedata limit ${limit} offset ${offset}`;
    let sql = `select * from employeedata`;
    console.log(sql);
    connection.query(sql, (err,res2)=>{
        if(err){
            res.status(500).json({'status':'failed', 'message':'server error'});
        }else{
            if(res2.length==0){
                res.status(200).json({'status':'success', 'message':'no data available', 'data':[]});
            }else if(res2.length>0){
                res.status(200).json({'status':'success', 'message':'data found', 'data':res2});
            }
        }
    })
})

router.get('/getEmployees', jwt.validateToken, (req, res)=>{  
    console.log('getEmployee');
    let body = req.query;
    let offset = (body.page-1)*body.limit;
    let limit = body.limit;
    let sql = `select * from employeedata limit ${limit} offset ${offset}`;
    console.log(sql);
    connection.query(sql, (err,res2)=>{
        if(err){
            res.status(500).json({'status':'failed', 'message':'server error'});
        }else{
            if(res2.length==0){
                res.status(200).json({'status':'success', 'message':'no data available', 'data':[]});
            }else if(res2.length>0){
                res.status(200).json({'status':'success', 'message':'data found', 'data':res2});
            }
        }
    })
})

// router.get('/searchEmployees/:searchText', (req,res)=>{
    // console.log(req.params.searchText);
router.get('/searchEmployees', (req,res)=>{    
    console.log(req.query.searchText);
    let searchText = req.query.searchText;
    let sql = `select * from employeedata where firstname like '%${searchText}%' or lastname like '%${searchText}%'`;
    connection.query(sql, (err,res2)=>{
        if(err){
            res.status(500).json({'status':'failed', 'message':'server error'});
        }else{
            if(res2.length==0){
                res.status(200).json({'status':'success', 'message':'no data available', 'data':[]});
            }else if(res2.length>0){
                res.status(200).json({'status':'success', 'message':'data found', 'data':res2});
            }
        }
    })
})

router.post('/newEmployee', jwt.validateToken, (req, res)=>{
    let body = req.body;
    if(body.eid && body.eid !=''){
        let sql1 = `update employeedata set firstname='${body.firstname}', lastname='${body.lastname}', dob='${body.dob}', doj='${body.doj}', gender='${body.gender}', role='${body.role}', 
                    mobile='${body.mobile}', email='${body.email}', martial='${body.martial}', aadhar='${body.aadhar}', username='${body.username}' where eid='${body.eid}'`;
        connection.query(sql1, (err,res2)=>{
            if(err){
                console.log(err);
                res.status(500).json({status:'failed','message':'failed to update employee'});
            }else if(res2){
                console.log(res2);
                console.log('successfully employee updated');
                res.status(200).json({'status':'success', 'message':'employee updated successfully'});
            }
        })
    }else{
        let pwd = Math.floor(Math.random()*1000000);
        let sql1 = `insert into login(username,password,role) values('${body.username}', ${pwd},'${body.role}')`;
        connection.query(sql1, (err,res2)=>{
            if(err){
                console.log(err);
                res.status(500).json({status:'failed','message':'failed to created login'});
            }else if(res2){
                console.log(res2);
                console.log('successfully login created');
                let sql2 = `insert into employeedata set ?`;
                connection.query(sql2, body, (err3, res3)=>{
                    if(err3){
                        res.status(500).json({status:'failed','message':'failed to add employee'});
                    }else if(res3){
                        console.log('successfully employee added');
                        res.status(200).json({'status':'success', 'message':'employee added successfully'});
                    }
                })
            }
        })
    }
    
})


// Tasks
router.get('/getTasks', jwt.validateToken, (req,res)=>{
    console.log(req.query);
    let query = req.query;
    let sql;
    if(query.createdby){
        sql = `select * from task where createdby='${query.createdby}'`;
    }else{
        sql = `select * from task where assignto='${query.assignto}'`;
    }

    console.log(sql);

    connection.query(sql, (err2,res2)=>{
        if(err2){
            res.status(500).json({'status':'failed', 'message':'failed'});
        }else{
            if(res2.length==0){
                res.status(200).json({'status':'success', 'message':'no data found', data:[]});
            }else if(res2.length>0){
                res.status(200).json({'status':'success', 'message':'data found successful', data:res2});
            }
        }
    })
})

router.post('/newTask', jwt.validateToken, (req,res)=>{
    let body = req.body;
    if(body.tid && body.tid!=''){
        let sql = `update task set assignto='${body.assignto}', assignuser='${body.assignuser}', tasktype='${body.tasktype}', priority='${body.priority}', taskdate='${body.taskdate}', description='${body.description}', createdby='${body.createdby}', updatedby='${body.updatedby}', updateddate='${body.updateddate}', remarks='${body.remarks}', status='${body.status}', charge='${body.charge}', inchargeremarks='${body.inchargeremarks}' where tid=${body.tid}`;
        connection.query(sql, body, (err2, res2)=>{
            if(err2){
                console.log(err2);
                res.status(500).json({status:'failed', message:'failed to update task'});
            }else if(res2){
                console.log(res2);
                res.status(200).json({'status':'success', 'message':'task updated successful'})
            }
        })
    }else{
        let sql = `insert into task set ?`;
        connection.query(sql, body, (err2, res2)=>{
            if(err2){
                console.log(err2);
                res.status(500).json({status:'failed', message:'failed to add task'});
            }else if(res2){
                console.log(res2);
                res.status(200).json({'status':'success', 'message':'task added successful'})
            }
        })
    }
})


//Password
router.post('/updatePassword', jwt.validateToken, (req,res)=>{
    let body = req.body;

    let sql = `update login set password=${body.new} where username='${body.username}' and password='${body.old}'`;
    console.log(sql);
    connection.query(sql, (err2, res2)=>{
        if(err2){
            res.status(500).json({'status':'failed', 'message':'user not found'})
        }else if(res2.affectedRows == 0){
            console.log(res2)
            res.status(401).json({'status':'failed', 'message':'old password is wrong'});
        }else if(res2.affectedRows == 1){
            console.log(res2)
            res.status(200).json({'status':'success', 'message':'password updated successfully','data':res2});
        }
    })
})


//File Upload
router.post('/uploadFile', uploads.single('file'), (req,res)=>{
    console.log(req);
    console.log('File uploaded successfully');
    
    res.status(200).json({'status':'success', 'message':'file uploaded successful', data:req.file});
})

router.get('/downloadFile/:filename', (req,res)=>{
    console.log(req.params.filename);
    let filename = req.params.filename
    let filepath = path.join(__dirname, './uploads', filename);
    console.log(filepath);

    res.download(filepath, filename, (req)=>{
        // if(err){
        //     console.error('Error downloading file:', err);
        //     res.status(500).send('Error downloading file');
        // }else{
        //     console.log('File downloaded successfully');
        //     res.status(200).json({'status':'success','message':'downloading file'});
        // }
    })
})
module.exports = router;