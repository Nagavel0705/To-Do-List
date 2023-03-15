const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require('lodash');
const mongoose = require('mongoose');

const app = express();

const { username, password, port } = require('./config');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

async function main(){
    mongoose.connect("mongodb+srv://" + username + ":" + password +"@cluster0.9rhhpgy.mongodb.net/todolistDB");

    // Definition of Schemas
    const itemsSchema = {
        itemName: String
    };

    const listSchema = {
        name: String,
        items: [itemsSchema]
    }

    // Model Schemas
    const Item = mongoose.model("Item", itemsSchema);

    const List = mongoose.model("List", listSchema);

    // Default items in default list
    const item1 = new Item({
        itemName: "Welcome to your To-Do List",
    });

    const item2 = new Item({
        itemName: "You know the rules",
    });

    const item3 = new Item({
        itemName: "Let's get productive 😸",
    });

    const defaultItems = [item1, item2, item3];

    let flag = 0;

    // home page/landing page
    app.get("/", async function(req, res){

        const findResult = await Item.find();

        if (findResult.length === 0 && flag === 0){
            await Item.insertMany(defaultItems)
            flag = 1;
            res.redirect("/");
        } else {
            res.render("list", {listTitle: date(), newListItems: findResult});
        }
    });

    //Express Routing method to include more lists
    app.get("/:customListName", async function(req, res){
        const customListName = _.capitalize(req.params.customListName);

        const foundList = await List.findOne({name: customListName});
        if(foundList === null){
            // console.log("DNE!");
            const list = new List({
                name: customListName,
                items: defaultItems
            });
    
            list.save();

            res.redirect("/" + customListName);
        } else {
            // Showing an existing list
            // console.log("Exists");
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    });

    app.post("/", async function(req,res){
        // console.log(req.body);
        const listName = req.body.list;
        const newItem = new Item({
            itemName: req.body.AddItem,
        });

        const day = date().split(" ")[0]
        if(listName === day){
            newItem.save();
            res.redirect("/");   
        } else {
            const foundList = await List.findOne({name: listName});
            // console.log(foundList);
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        }
    });

    

    app.post("/delete", async function(req, res){
        const idToBeDeleted = req.body.myCheckbox;
        const listName = req.body.listName;

        if(listName === date()){
            await Item.findByIdAndDelete({_id: idToBeDeleted});
            res.redirect("/");
        } else {
            await List.findOneAndUpdate({name: listName}, {$pull: { items: {_id: idToBeDeleted} } } );
            res.redirect("/" + listName);
        }
    });

    app.post("/reset", async function(req, res){
        const listName = req.body.listName;
        // console.log(listName)
        if(listName === date()){
            await Item.deleteMany();
            await Item.insertMany(defaultItems);
            res.redirect("/");
        } else{
            await List.deleteMany({name: listName});
            res.redirect("/" + listName);
        }
    })

    app.listen(port, function(req, res){
        console.log("Listening on port 3000");
    });
}

main()