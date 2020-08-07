const express=require('express');
const body = require('body-parser');
const bcrypt =require('bcrypt-nodejs');
const cors=require('cors');
const app=express();

app.use(body.json());
app.use(cors());
var knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'jayaswini',
    database : 'smartbrain'
  }
});
knex.select('*').from('people').then(data=>{
	console.log(data);
});
app.get('/',(req,res)=>{
    res.json(database.users);
});
app.get('/profile/:id',(req,res)=>{
	const {id}=req.params;
	let found = false;
	knex.select('*').from('people').where({
              id: id
          })
		.then(response=>{
			if(response.length){
			res.json(response[0]);
	}
	 else{
	 	res.json("Not found");
	 }
	})
	.catch(err=>res.json("Not found"));
	

});
app.put('/image',(req,res)=>{
	let found = false;
	database.users.forEach(user =>{
        if(user.id=== req.body.id){
        	found=true;
            user.entries++;
        	return res.json(user.entries);
        }
	});
	if(!found){
		res.status(404).json("no user");
	}

});
app.post('/signin',(req,res)=>{
	knex.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      console.log(isValid);
      if (isValid) {
        return knex.select('*').from('people')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json('yes')
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
	//bcrypt.compare("veggie", hash, function(err, res) {
    // res == true
//});

});
app.post('/register',(req,res)=>{
var hash = bcrypt.hashSync(req.body.password);

//bcrypt.compareSync("bacon", hash); // true
//bcrypt.compareSync("veggies", hash); // false
knex.transaction(trx=>{
      trx.insert({
      	hash:hash,
      	email:req.body.email
      }).into('login').returning('email').then(loginemail=>{
      	return trx('people')
	.returning('*')
	.insert({
		name: req.body.name,
		email: loginemail[0],
		joined: new Date()
	})
	.then(response=>{
	res.json(response[0])
   })
})
      .then(trx.commit)
      .catch(trx.rollback)
  })
      .catch(err=>res.json("unable to register"));
});
	

// Load hash from your password DB.

//bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
//});
app.listen(process.env.PORT || 3000);