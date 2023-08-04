const express= require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mysql =require("mysql");
const sessions = require('express-session');
const multer = require('multer');
const path = require('path');

const app=express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/file',express.static('public/uploads'));

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

var session;

const connection=mysql.createPool({
    connectionLimit:10,
    host:"localhost",
    user:"root",
    password:"",
    database:"FAA"
})


//set password and mail for admin
const adminMail="teamFAA@gmail.com";
const adminPass="tasfia12";

//set password and mail for admin
const bloggerMail="bloggerFAA@gmail.com";
const bloggerPass="tasfia13";



const storage=multer.diskStorage({
    destination:"public/uploads/",
    filename:function(req,file,cb){
      cb(null,file.fieldname+'_'+Date.now()+path.extname(file.originalname));
    }
 });
  
const upload=multer({
    storage:storage
}).single('image');





app.get("/",function(req,res){
    //res.render("home");
    var getQuery1="select * from successfulevents"
    var getQuery2="select  * from upcomingEvent order by id desc LIMIT 1"
 
    connection.query(getQuery1,function(err,events){
        connection.query(getQuery2,function(err,upcoming){
            if(err) 
            {
                res.send(err)
            }
            res.render('home',{
                    events:events,
                    upcoming:upcoming
                })
            })
        })
})


app.get("/education",function(req,res){
    
    var sql = "Select * from education ";
    var query = connection.query(sql,function(err,eds){
        if(err) res.send(err);
        res.render('education',{
            eds:eds
        });
    });
})

app.get("/education_events/:id",function(req,res){
    var id = req.params.id;
    var sql = `Select * from education where id = ${id}`;
    var query = connection.query(sql,function(err,edls){
        if(err) res.send(err);
        res.render('education_events',{
            edls:edls
        });
    });
})

app.get("/health",function(req,res){
    //res.render("health");
    var sql="SELECT * FROM health";
    connection.query(sql,function(er,hlts){
     if(er) res.send(er)
     res.render("health",{
        hlts:hlts
     })
    })
})

app.get("/health_events/:id",function(req,res){
    var id = req.params.id;
    var sql = `Select * from health where id = ${id}`;
    var query = connection.query(sql,function(err,hlts){
        if(err) res.send(err);
        res.render('health_events',{
            hlts:hlts
        });
    });
})

app.get("/financial",function(req,res){
    //res.render("financial");
    var sql="SELECT * FROM financial";
    connection.query(sql,function(er,fls){
     if(er) res.send(er)
     res.render("financial",{
        fls:fls
     })
    })
})

app.get("/successful",function(req,res){
    res.render("message")
})

app.post("/donation-method",function(req,res){
    var data={
        phone:req.body.phone,
        transaction:req.body.tid,
        method:req.body.select
    }


    var sql="insert into donate set?"
    var query = connection.query(sql,data,function(er){
        if(er) res.send(er);
        //console.log("yes");
        else{
            var sq='select * from Donate'
            connection.query(sq,function(er,result){
                if(er){
                    res.send(er)
                }
                if(result.length>0){
                    res.render('message.ejs')
                }
            })
          
        }
        //res.redirect("/financial")
    });


})

app.get("/untoldStories",function(req,res){
    //res.render("untold");
    var sql="SELECT * FROM untoldStory";
    connection.query(sql,function(er,untlds){
     if(er) res.send(er)
     res.render("untold",{
        untlds:untlds
     })
    })
})

app.get("/untold_stories/:id",function(req,res){
    var id = req.params.id;
    var sql = `Select * from untoldStory where id = ${id}`;
    var query = connection.query(sql,function(err,untlds){
        if(err) res.send(err);
        res.render('untold_stories',{
            untlds:untlds
        });
    });
})

app.get("/blog",function(req,res){
    //res.render("blog");
    var approval='Yes'
    var sql="SELECT * FROM blogger WHERE approve=?";
    connection.query(sql,[approval],function(er,blgs){
     if(er) res.send(er)
     res.render("blog",{
         blgs:blgs
     })
    })
})

app.get("/blogs/:id",function(req,res){
    var id = req.params.id;
    var sql = `Select * from blogger where id = ${id}`;
    var query = connection.query(sql,function(err,blgs){
        if(err) res.send(err);
        res.render('blogs',{
            blgs:blgs
        });
    });
})



/************************Admin part**************************/
app.get("/admin-login",function(req,res){
    res.render("login");
})

app.post("/admin-login",function(req,res){
    var mymail= req.body.email;
    var mypass=req.body.pass;
    var opt=req.body.select;
    
 
    if(opt==1){
        if(mymail===adminMail){
            if(mypass===adminPass){
             session=req.session;
             session.email=mymail;
             res.redirect("/dashboard")
            }else{
                res.send("password does not matched")
            }
        }else{
         res.send("Your mail address is not correct")
        }

    }
    if(opt==2){
        if(mymail===bloggerMail){
            if(mypass===bloggerPass){
             session=req.session;
             session.email=mymail;
             res.redirect("/Blogger-dashboard")
            }else{
                res.send("password does not matched")
            }
        }else{
         res.send("Your mail address is not correct")
        }
    }
    
    
 
 
 })


//dashboard for admin
app.get("/dashboard",function(req,res){
  
    session=req.session;
    if(session.email){ 
       // res.render("dashboard");
       var approval='No';
       var sql="SELECT * FROM blogger WHERE approve=?";
       connection.query(sql,[approval],function(er,blgs){
        if(er) 
        {
            res.send(er)
        }
        res.render('dashboard',{
                blgs:blgs
            })
        })
        
    }else{
     res.redirect("/admin-login")
    }
})

//dashboard for blogger
app.get("/Blogger-dashboard",function(req,res){
    session=req.session;
    if(session.email){ 
        res.render("dashboard2");

    }else{
     res.redirect("/admin-login")
    }
})


app.post('/blogger-post',upload,function(req,res){
    if(req.file){
        var data={
           
            title:req.body.title,
            details:req.body.details,
            image:`http://localhost:8000/file/${req.file.filename}`
        }

    }else{
        var data={
            //image:`http://localhost:8000/file/${req.file.filename}`,
            title:req.body.title,
            details:req.body.details

        }
    }

    var sql="insert into blogger set?";
    connection.query(sql,data,function(er){
        if(er) res.send(er)
        res.redirect("/blogger-dashboard")
    })
})

app.post("/dashboard/:id",function(req,res){
    var id=req.params.id;
    var approval='Yes'


    var sql="Update blogger Set approve = '"+approval+"' where id="+id;
    connection.query(sql,function(er){
        if(er) res.send(er)
        res.redirect("/dashboard")
    })
})

app.get("/blog-list",function(req,res){
    
    session=req.session;
    if(session.email){ 
       // res.render("");
       var sql=`select * from blogger where approve='Yes'`
       connection.query(sql,function(er,bls){
           if(er) res.send(er)
            res.render('bloglist',{
            bls:bls
           })

       })

       
    }else{
     res.redirect("/admin-login")
    }
})

app.get("/blog_delete_from_list/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from blogger where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/blog-list")
    });
})

app.get("/delete_blog/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from blogger where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/dashboard")
    });
})

app.get("/successful-events",function(req,res){
    session=req.session;
    if(session.email){ 
        res.render("successful");
       
    }else{
     res.redirect("/admin-login")
    }
   
})

app.post("/successful-events-post",upload,function(req,res){
    if(req.file){
        var data={
            image:`http://localhost:8000/file/${req.file.filename}`,
            title:req.body.title,
            details:req.body.details

        }

    }else{
        var data={
            //image:`http://localhost:8000/file/${req.file.filename}`,
            title:req.body.title,
            details:req.body.details

        }
    }
    var sql="insert into `successfulevents` set?"
    var query = connection.query(sql,data,function(er){
        if(er) res.send(er);
        res.redirect("/successful-events")
    });

})

app.get("/successful-events-lists",function(req,res){
  
    session=req.session;
    if(session.email){ 
       // res.render("");
       var sql=`select * from successfulevents`
       connection.query(sql,function(er,sus){
           if(er) res.send(er)
            res.render('success_events',{
            sus:sus
           })

       })

       
    }else{
     res.redirect("/admin-login")
    }
    
})

app.get('/sedit/:id',function(req,res){
    var id = req.params.id;
    var sql = `Select * from successfulevents where id = ${id}`;
    var query = connection.query(sql,function(err,sus){
        if(err) res.send(err);
        res.render('sedit',{
            sus:sus
        });
    });
})

app.post("/sedit/:id",upload,function(req,res){
    var id = req.params.id;

    if(req.file){
        var sql="UPDATE successfulevents SET  image = '"+`http://localhost:8000/file/${req.file.filename}`+"',title='"+req.body.title+"', details = '"+req.body.details+"' where id="+id;
    }else{
        var sql="UPDATE successfulevents SET title='"+req.body.title+"',  details = '"+req.body.details+"' where id="+id;
    }

    //console.log(sql);
    var query = connection.query(sql,function(err,sus){ 
        if(err) res.send(err);
        res.send("success");
        //res.redirect('/successful-events-lists');
        
    });
})

app.get("/sdelete/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from successfulevents where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/successful-events-lists")
    });
})

app.get("/upcoming-events",function(req,res){
    
    session=req.session;
    if(session.email){ 
        res.render("upcoming");
       
    }else{
     res.redirect("/admin-login")
    }
})

app.post("/upcoming-event-post",function(req,res){
    
    var date=req.body.date
     var title=req.body.event
     var link=req.body.link

    /* const id="1"
    //console.log(data);*/
    var data={
        date:req.body.date,
        title:req.body.event,
        details:req.body.link
    }

    var sql="insert into upcomingEvent set?"
    connection.query(sql,data,function(er){ 
        if(er) res.send(er)
        //console.log("he");
        res.redirect("/upcoming-events")
    })
    
})


app.get("/untold-stories",function(req,res){

    session=req.session;
    if(session.email){ 
        res.render("untoldstoryupload");
       
    }else{
     res.redirect("/admin-login")
    }
})

app.post("/untold-stoies-post",upload,function(req,res){
    if(req.file){
        var data={
            title:req.body.title,
            image:`http://localhost:8000/file/${req.file.filename}`,
            details:req.body.details

        }

    }else{
        var data={
            title:req.body.title,
            //image:`http://local title:req.body.title,
            details:req.body.details

        }
    }
    var sql="insert into `untoldStory` set?"
    var query = connection.query(sql,data,function(er){
        if(er) res.send(er);
        //console.log("ok");
        res.redirect("/untold-stories")
    });

})

app.get("/untoldList-update",function(req,res){
  
    session=req.session;
    if(session.email){ 
       // res.render("");
       var sql=`select * from untoldStory`
       connection.query(sql,function(er,uns){
           if(er) res.send(er)
            res.render('untoldlist',{
            uns:uns
           })

       })

       
    }else{
     res.redirect("/admin-login")
    }
    
})

app.get('/untldedit/:id',function(req,res){
    var id = req.params.id;
    var sql = `Select * from untoldStory where id = ${id}`;
    var query = connection.query(sql,function(err,uns){
        if(err) res.send(err);
        res.render('untldedit',{
            uns:uns
        });
    });
})

app.post("/untldedit/:id",upload,function(req,res){
    var id = req.params.id;

    if(req.file){
        var sql="UPDATE untoldStory SET title='"+req.body.title+"', image = '"+`http://localhost:8000/file/${req.file.filename}`+"', details = '"+req.body.details+"' where id="+id;
    }else{
        var sql="UPDATE untoldStory SET title='"+req.body.title+"',  details = '"+req.body.details+"' where id="+id;
    }

    //console.log(sql);
    var query = connection.query(sql,function(err,uns){ 
        if(err) res.send(err);
        //res.send("success");
        res.redirect('/untoldList-update');
        
    });
})

app.get("/untlddelete/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from untoldStory where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/untoldList-update")
    });
})


//*********************education**********************//

app.get("/education-events-upload",function(req,res){

    session=req.session;
    if(session.email){ 
        res.render("edu_event");
       
       
    }else{
     res.redirect("/admin-login")
    }
})


app.post("/education-info-posts",upload,function(req,res){
    if(req.file){
        var data={
            title:req.body.title,
            image:`http://localhost:8000/file/${req.file.filename}`,
            date:req.body.date,
            location:req.body.location,
            details:req.body.details

        }
    }else{
        var data={
            title:req.body.title,
           // image:`http://localhost:8000/file/${req.file.filename}`,
            date:req.body.date,
            location:req.body.location,
            details:req.body.details

        }
    }


    var sql="insert into education set?"
    var query = connection.query(sql,data,function(er){
        if(er) res.send(er);
        res.redirect("/education-events-upload")
    });
})

app.get("/education-update",function(req,res){
  
    session=req.session;
    if(session.email){ 
       // res.render("");
       var sql=`select * from education`
       connection.query(sql,function(er,edus){
           if(er) res.send(er)
            res.render('edu_update',{
            edus:edus
           })

       })

       
    }else{
     res.redirect("/admin-login")
    }
    
})

app.get('/educationUpdate/:id',function(req,res){
    var id = req.params.id;
    var sql = `Select * from education where id = ${id}`;
    var query = connection.query(sql,function(err,edms){
        if(err) res.send(err);
        res.render('educationUpdate',{
            edms:edms
        });
    });
})

app.post("/educationUpdate/:id",upload,function(req,res){
    var id = req.params.id;

    if(req.file){
        var sql="UPDATE education SET title='"+req.body.title+"', image = '"+`http://localhost:8000/file/${req.file.filename}`+"', date = '"+req.body.date+"', location= '"+req.body.location+"', details = '"+req.body.details+"' where id="+id;
    }else{
        var sql="UPDATE education SET title='"+req.body.title+"', date = '"+req.body.date+"', location= '"+req.body.location+"', details = '"+req.body.details+"' where id="+id;
    }

    //console.log(sql);
    var query = connection.query(sql,function(err,edms){ 
        if(err) res.send(err);
        //res.send("success");
        res.redirect('/education-update');
        
    });
})

app.get("/edu_delete/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from education where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/education-update")
    });
})

//*********************health**********************//

app.get("/health-events-upload",function(req,res){
    
    session=req.session;
    if(session.email){ 
        res.render("health_create");
       
       
    }else{
     res.redirect("/admin-login")
    }
})

app.post("/health-info-posts",upload,function(req,res){
    if(req.file){
        var data={
            title:req.body.title,
            date:req.body.date,
            location:req.body.location,
            details:req.body.details,
            image:`http://localhost:8000/file/${req.file.filename}`

        }
    }else{
        var data={
            title:req.body.title,
           // image:`http://localhost:8000/file/${req.file.filename}`,
            date:req.body.date,
            location:req.body.location,
            details:req.body.details

        }
    }


    var sql="insert into health set?"
    var query = connection.query(sql,data,function(er){
        if(er) res.send(er);
        //console.log("yes");
        res.redirect("/health-events-upload")
    });
})

app.get("/health-update",function(req,res){
    
    session=req.session;
    if(session.email){ 
       // res.render("");
       var sql=`select * from health`
       connection.query(sql,function(er,hls){
           if(er) res.send(er)
            res.render('health_update',{
            hls:hls
           })

       })

       
    }else{
     res.redirect("/admin-login")
    }
})


app.get('/healthUpdate/:id',function(req,res){
    var id = req.params.id;
    var sql = `Select * from health where id = ${id}`;
    var query = connection.query(sql,function(err,hls){
        if(err) res.send(err);
        res.render('healthUpdate',{
            hls:hls
        });
    });
})

app.post("/healthUpdate/:id",upload,function(req,res){
    var id = req.params.id;
  
    if(req.file){
        var sql="UPDATE health SET title='"+req.body.title+"', date = '"+req.body.date+"', location= '"+req.body.location+"', details = '"+req.body.details+"', image = '"+`http://localhost:8000/file/${req.file.filename}`+"' where id="+id;
    }else{
        var sql="UPDATE health SET title='"+req.body.title+"', date = '"+req.body.date+"', location= '"+req.body.location+"', details = '"+req.body.details+"' where id="+id;
    }

    //console.log(sql);
    var query = connection.query(sql,function(err,hls){ 
        if(err) res.send(err);
        //res.send("success");
        res.redirect('/health-update');
        
    });
})

app.get("/health_delete/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from health where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/health-update")
    });
})

//*********************Financial**********************//

app.get("/financial-events-upload",function(req,res){
    //res.render("financial_update");
    session=req.session;
    if(session.email){ 
        res.render("financial_update");
       
       
    }else{
     res.redirect("/admin-login")
    }
})

app.post("/financial-event-post",upload,function(req,res){
    if(req.file){
        var data={
            image:`http://localhost:8000/file/${req.file.filename}`,
            title:req.body.title,
            details:req.body.details


        }
    }else{
        var data={
            title:req.body.title,
           
            details:req.body.details,

        }
    }


    var sql="insert into financial set?"
    var query = connection.query(sql,data,function(er){
        if(er) res.send(er);
        //console.log("yes");
        res.redirect("/financial-events-upload")
    });
})


app.get("/financial-update",function(req,res){
    //res.render("financialUpdate");
    session=req.session;
    if(session.email){ 
       // res.render("");
       var sql=`select * from financial`
       connection.query(sql,function(er,dns){
           if(er) res.send(er)
            res.render('financialUpdate',{
            dns:dns
           })

       })

       
    }else{
     res.redirect("/admin-login")
    }
})

app.get('/finupdate/:id',function(req,res){
    var id = req.params.id;
    var sql = `Select * from financial where id = ${id}`;
    var query = connection.query(sql,function(err,fns){
        if(err) res.send(err);
        res.render('finupdate',{
            fns:fns
        });
    });
})

app.post("/finupdate/:id",upload,function(req,res){
    var id = req.params.id;
  
   
    if(req.file){
        var sql="UPDATE financial SET image = '"+`http://localhost:8000/file/${req.file.filename}`+"', title = '"+req.body.title+"', details = '"+req.body.details+"' where id="+id;
    }else{
        var sql="UPDATE financial SET  title = '"+req.body.title+"', details = '"+req.body.details+"' where id="+id;
    }
    //console.log(sql);
    var query = connection.query(sql,function(err,hls){ 
        if(err) res.send(err);
        //res.send("success");
        res.redirect('/financial-update');
        
    });
})

app.get("/financial_delete/:id",function(req,res){
    var id = req.params.id;
    var sql = `DELETE from financial where id =${id}`;
    var query = connection.query(sql,function(er){
        if(er) res.send(er);
        res.redirect("/financial-update")
    });
})

app.get("/donators",function(req,res){
    //res.render("donators");
    session=req.session;
    if(session.email){ 
       // res.render("");
       var sql=`select * from Donate where checked='No'`
       connection.query(sql,function(er,dns){
           if(er) res.send(er)
            res.render('donators',{
            dns:dns
           })

       })

       
    }else{
     res.redirect("/admin-login")
    }
})


app.post("/check-payment/:id",function(req,res){
    var id=req.params.id;
    var checked='Yes'
    var sql="Update Donate Set checked = '"+checked+"' where id="+id;
    connection.query(sql,function(er){
        if(er) res.send(er)
        res.redirect("/donators")
    })
})

app.get("/check-list-of-donation",function(req,res){
    
    session=req.session;
    if(session.email){
    var sql=`select * from Donate where checked='Yes'`
    connection.query(sql,function(er,checkfs){
     if(er) res.send(er)
     res.render('paymentChecklist',{
         checkfs:checkfs
     })
 
    })}else{
       res.redirect("/admin-login")
    }
})

app.listen(8000,function(er){
 console.log("successfull");
});