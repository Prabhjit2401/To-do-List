const express = require('express');
const app = express();
const mongoose = require('mongoose');
const _ = require("lodash");

app.set("view engine","ejs");

app.use(express.static("public"));
app.use(express.urlencoded({extended : true}))

// creating a new database using mongoose.
mongoose.connect("mongodb+srv://admin_prabh:miasanmia@cluster0.thg1w.mongodb.net/todolistDB", {useNewUrlParser : true});

const itemsSchema = mongoose.Schema({
    name :{
        type : String,
        required : true
    } 
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name : "start college work."
});

const item2 = new Item({
    name : "Do coding practise."
})
const arr= [item1, item2];

const listSchema = mongoose.Schema({
    name : String,
    items : [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res)
{
    Item.find({}, function(err,data){
        if(err)
        {
            console.log(err);
        }
        else
        {
            if(data.length == 0)
            {
                Item.insertMany(arr, function(err){
                    if(err)
                    {
                        console.log(err);
                    }
                });
                res.redirect("/");
            }
            else
            {
                res.render("base", {kindOfDay : "Today" , newListItems : data})
            }
        }
    })
    // var today = new Date();
    // var currDay="";
    
    // var options = {
    //     weekday : "long",
    //     day : "numeric",
    //     month : "long"
    // };

    // currDay = today.toLocaleDateString("en-US",options);

});
 
app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err, list){
        if(!err)
        {
            if(list === null)  
            {
                // create new list    
                const list = new List({
                    name : customListName, 
                    items : arr
                })    
                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                res.render("base", {kindOfDay : list.name , newListItems : list.items});
            }
        }
    })
});


app.post("/", function(req,res)
{
    var itemName = req.body.newItem;
    var listName = req.body.list;
    // console.log(listName);
    if(itemName != "")
    {
        const item = new Item({
            name : itemName
        });

        if(listName == "Today")
        {
            item.save();
            res.redirect("/");
        }
        else
        {
            List.findOne({name:listName}, function(err,foundList)
            {
                foundList.items.push(item);
                foundList.save();
            })
            res.redirect("/"+listName);
        }
    }
});

app.post("/delete", function(req,res){
    const cid = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
        Item.deleteOne({_id : cid}, function(err){
            if(err)
            {
                console.log(err);
            }
        });
        res.redirect("/");
    }
    else
    {
        List.findOneAndUpdate({name:listName},{$pull : {items : {_id:cid}}}, function(err, foundlist){
            if(!err)
            {
                res.redirect("/"+listName);
            }
        })
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function()
{
    console.log("server is running.");
});