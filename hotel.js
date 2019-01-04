var express=require('express');
var passport=require('passport');
var localStrategy=require('passport-local').Strategy;

var bcrypt=require('bcrypt');

var app=express();

var session = require('express-session');
var flash=require('connect-flash');
var expressValidator=require('express-validator');

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

app.use(expressValidator({
	expressFormatter: function(param,msg,value){
		var namespace = param.split('.')
		,root = namespace.shift()
		,formParam = root;

		while(namespace.length){
			formParam+= '[' + namespace.shift() + ']';
		}
		return{
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));


var bodyParser=require('body-parser');

var urlencodedParser=bodyParser.urlencoded({extended: false});

app.set("view engine",'ejs');

app.use(express.static('./public'));


var mongoose=require('mongoose');

mongoose.connect('mongodb://hotel:hotel1@ds141972.mlab.com:41972/projecthotel');

var HotelSchema= new mongoose.Schema({
	city:String,
	type1:String,
	type2:String,
	type3:String,
	type4:String
});

var CitywiseSchema=  new mongoose.Schema({
	name:String,
	cost:String,
	main:String,
	type:String,
	serves:String,
	address:String,
	contact:String,
	reviews:String,
	twoseat:Number,
	fourseat:Number,
	sixseat:Number,
	twofront:Number,
	twoback:Number,
	twoleft:Number,
	tworight:Number,
	fourleft:Number,
	fourright:Number,
	fourback:Number,
	fourfront:Number,
	sixleft:Number,
	sixright:Number,
	sixback:Number,
	sixfront:Number
});

var HistorySchema= new mongoose.Schema({
	hotelname:String,
	date:String,
	city:String,
	personname:String,
	name:String,
	time:String,
	code:String
}); 

var CancelSchema= new mongoose.Schema({
	hotelname:String,
	date:String,
	city:String,
	personname:String,
	name:String,
	time:String,
	code:String
}); 

var ReviewSchema= new mongoose.Schema({
	resname:String,
	rescity:String,
	resreview:String,
	resdate:String,
	restime:String,
});

var loginSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true
	},
	password:{
		type: String,
		required: true
	},
	code:String
});

var Users= mongoose.model('Users',loginSchema);
var Review= mongoose.model('Review',ReviewSchema);
var Cancel= mongoose.model('Cancel',CancelSchema);
var History= mongoose.model('History',HistorySchema);
var Hotel= mongoose.model('Hotel',HotelSchema);
var Citywise= mongoose.model('Citywise',CitywiseSchema);

var user1=Users({name:'anjali jain',password:"anjali043",code:'1'}).save(function(err){
	if(err) throw err;
});

var history1=History({name:'anjali jain',code:'1',hotelname:'Family Restaurant',date:'01/01/2018',time:'02:00',personname:'anjali',city:'Udaipur'}).save(function(err){
	if(err) throw err;
});

var cancel1=Cancel({name:'anjali jain',code:'1',hotelname:'Beans Restaurant',date:'01/01/2018',time:'02:00',personname:'anjali',city:'Udaipur'}).save(function(err){
	if(err) throw err;
});

var reviewOne=Review({resname:'Family Restaurant',rescity:'Udaipur',resreview:'Best food with fair price',resdate:'01/01/2017',restime:'01:00'}).save(function(err){
	if(err) throw err;
});

var hotelOne=Hotel({city:'Udaipur',type1:'Indian',type2:'French',type3:'Chinese',type4:'South Indian'}).save(function(err){
	if(err) throw err;
});

var citywiseOne=Citywise({serves:'Non-veg',address:'Road-1',contact:'2222222222',reviews:'none',main:'Indian',type:'Indian,Chinese',name:'Family Restaurant',cost:'700 ruppes',twoseat:'5',fourseat:'4',sixseat:'3',twoleft:'2',tworight:'1',twofront:'1',twoback:'1',fourleft:'1',fourfront:'2',fourright:'1',fourback:'0',sixleft:'1',sixright:'1',sixfront:'0',sixback:'1'}).save(function(err){
	if(err) throw err;
});

var citywiseTwo=Citywise({serves:'Veg',address:'Road-6',contact:'2345678965',reviews:'none',main:'Indian',type:'Indian',name:'Beans Restaurant',cost:'800 ruppes',twoseat:'7',fourseat:'10',sixseat:'5',twoleft:'2',tworight:'3',twofront:'1',twoback:'3',fourleft:'0',fourfront:'3',fourright:'2',fourback:'3',sixleft:'1',sixright:'1',sixfront:'1',sixback:'2'}).save(function(err){
	if(err) throw err;
});

function one(passport){
	passport.use(new localStrategy(function(username,password,done){

		var query = {name:username};
		Users.findOne(query,function(err,user){
			if(err) throw err;
			if(!user){
				return done(null,false,{message:'no user found'});
			}

			bcrypt.compare(password,user.password,function(err,isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null,user);
				}
				else
				{
					return done(null,false,{message:'wrong password'});
				}
			});
		});
	}));

	passport.serializeUser(function(user,done){
		done(null,user.id);
	});

	passport.deserializeUser(function(id,done){
		Users.findById(id,function(err,user){
			done(err,user);
		});
	});
}

app.post('/signup',urlencodedParser,function(req,res){

		req.checkBody('name','Name is required').notEmpty();
		req.checkBody('password','password is required').notEmpty();
		req.checkBody('password2','passwords do not match').equals(req.body.password);

		let errors = req.validationErrors();

		if(errors){
			res.render('hotelsignup',{errors:errors});
		}
        else
        {
          bcrypt.genSalt(10,function(err,salt){
          	bcrypt.hash(req.body.password,salt,function(err,hash){
          		if(err) throw err;

          	req.body.password=hash;
          	var user1= Users(req.body).save(function(err,data){
        	if(err) throw err;
            res.render('loggedhotel');
          });
        
        });
    });

	};
});


app.get('/',function(req,res){

	res.render('hotelmain');
});
app.get('/login',function(req,res){

	res.render('hotellogin');
});

app.get('/logged',function(req,res){

	res.render('loggedhotel');
});

app.post('/login',urlencodedParser,function(req,res,next){

		passport.authenticate('local',{
			successRedirect:'/logged',
			failureRedirect:'/login',
			failureFlash:true
		})(req,res,next);
	});

app.get('/profile',function(req,res){

	res.render('profile');
});

app.get('/cuisine',function(req,res){

	res.render('cuisine');
});

app.post('/cuisine2',urlencodedParser,function(req,res){

   app.locals.city=req.body.city;
   var query={city:req.body.city};
   Hotel.find(query,function(err,data){
   	if(err) throw err;
   	res.render('cuisine2',{data:data});
   });

});

app.get('/Indian',function(req,res){
    
    var query={main:'Indian'};
    app.locals.main='Indian';
	Citywise.find(query,function(err,data){
		if(err) throw err;
		res.render('cuisine3',{data:data});
	});
});

app.get('/details/:id',function(req,res){

	var query={_id:req.params.id};
    Citywise.findById(query,function(err,data){
    	if(err) throw err;
    	app.locals.data=data;
    	res.render('cuisine4');
    });
});

app.post('/dateandtime',urlencodedParser,function(req,res){
   
   app.locals.pname=req.body.pname;
   app.locals.date=req.body.date;
   app.locals.time=req.body.time;
   res.redirect('/');

});
app.post('/side',urlencodedParser,function(req,res){
 
 	app.locals.seatpart2=req.body.side;
 	res.render('cuisine5');

});

app.get('/tabletypes',urlencodedParser,function(req,res){

	res.render('cuisine6');
});

app.get('/avail2/:id',function(req,res){

	app.locals.seat="2 Seater";
	var query={_id:req.params.id};
    Citywise.findById(query,function(err,data){
    	if(err) throw err;
    	res.render('avail2',{data1:data});

});
});

app.get('/avail4/:id',function(req,res){

    app.locals.seat="4 Seater";
	var query={_id:req.params.id};
    Citywise.findById(query,function(err,data){
    	if(err) throw err;
    	res.render('avail4',{data2:data});

});
});

app.get('/avail6/:id',function(req,res){
    
    app.locals.seat="6 Seater";
	var query={_id:req.params.id};
    Citywise.findById(query,function(err,data){
    	if(err) throw err;
    	res.render('avail6',{data3:data});

});
});

app.post('/side',urlencodedParser,function(req,res){

    app.locals.seatpart2=req.body.side;
	res.render('username');
});

app.post('/name',urlencodedParser,function(req,res){

	res.redirect('/');
});

app.get('/bookings',function(req,res){

	res.render('confirm');
});

app.get('/save/:name1/:city/:name2/:date/:time',function(req,res){

 var history1=History({hotelname:req.params.name1,city:req.params.city,personname:req.params.name2,date:req.params.date,time:req.params.time}).save(function(err){
 	if(err) throw err;
 	res.render('loggedhotel');
 });
});

app.get('/previousbooking',function(req,res){
       
    res.render('previous',{prevdata:[]});
}); 

app.post('/previousbooking',urlencodedParser,function(req,res){
    
    var query={code:req.body.loggedname};
    Users.find(query,function(err,data){
    	if(err) {
    		res.render('previous',{prevdata:[]});
    	}
    	else
    	{
    		History.find(query,function(err,data){
    	 if(err) throw err;
    	 res.render('previous',{prevdata:data});
    	});
    }
}); 
});      

app.get('/cancelbooking',function(req,res){
       
    res.render('cancel',{canceldata:[]});
}); 

app.post('/cancelbooking',urlencodedParser,function(req,res){
    
    var query={code:req.body.loggedcname};
    Users.find(query,function(err,data){
    	if(err) {
    		res.render('cancel',{prevdata:[]});
    	}
    	else
    	{
    		History.find(query,function(err,data){
    	 if(err) throw err;
    	 res.render('cancel',{canceldata:data});
    	});
    }
}); 
});

app.get('/reviews',function(req,res){

	Review.find({},function(err,data){
		if(err) throw err;
		res.render('reviews',{reviewinfo:data});
	});
});

app.post('/addreview',urlencodedParser,function(req,res){

	var reviewTwo=Review({resname:req.body.restname,rescity:req.body.restcity,resreview:req.body.restreview,resdate:req.body.restdate,restime:req.body.resttime}).save(function(err){
		if(err) throw err;
	});
	res.redirect('/reviews');
});

one(passport);
app.listen('8080');