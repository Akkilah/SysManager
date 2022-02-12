var express = require("express");
var component = express.Router();
const db = require('../config/db'); // db init 

component.get("/create", (req, res) => {
  res.render("createComponent");
});


// define the about route
component.post("/create", (req, res) => {
  let Error = []
  let { tempName, key, type } = req.body;
  let data = {
    tempName,
  };

  //this to handle when the user just use one key value
  if (!(typeof key === "string")) {
    key.forEach((element, i) => {
      data[i] = {};
      data[i].id = i;
      data[i].key = element;
      data[i].type = type[i];
    });
  } else {
    data[0] = {
      key,
      type,
    };
  }


 //Check if the user name is used befor
 let query = `INSERT INTO component_templet (component_templetname,component_prop) VALUES ('${data.tempName}','${JSON.stringify(data)}');`
 db.query(query,(err,result,filed)=>{

    if(err){
        console.log('there is a connectiong errer')
        Error.push({msg:err.sqlMessage})
        console.log(err.sqlMessage)
        res.render('createComponent',{Error})
        
    }else{

        console.log('success');
        res.redirect("/");
    }




 })
  console.log(data);
});

module.exports = component;
