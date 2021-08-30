const express = require("express");
const bodyparser = require("body-parser");
const dates = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
mongoose.set('useFindAndModify', false);
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');




mongoose.connect("mongodb+srv://monu:qazx1212@cluster0.hc7jj.mongodb.net/todolist?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please check your data entry no name is specified"]
    }
});

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome to your todo list"
});
const item2 = new Item({
    name: "Hit the + button to add a new line in the form"
});
const item3 = new Item({
    name: "<--Hit this to delete an item"
});


const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please check your data entry no name is specified"]
    },
    items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {
    Item.find({}, function (err, itm) {
        //Itm comes in the form of the array
        if (itm.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("success");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", { kindofday: "Today", info: itm });
        }


    });

});
// app.get("/work", function(req, res){
//     res.render("list", {kindofday: "work", info: workdone});
// });
// app.get("/about", function(req, res){
//     res.render("about");
//});
app.get("/:text", function (req, res) {
    var customlistname = _.capitalize(req.params.text);

    List.findOne({ name: customlistname }, function (err, foundlist) {
        if (!err) {
            if (!foundlist) {
                //create the new list
                const list = new List({
                    name: customlistname,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customlistname);
            }
            else {
                //show existing list
                res.render("list", { kindofday: foundlist.name, info: foundlist.items });
            }
        }
    })



});

app.post("/", function (req, res) {
    const itemName = req.body.num;
    const listname = req.body.list;
    console.log(req.body);
    const item = new Item({
        name: itemName
    });
    if (listname == "Today") {
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({name: listname}, function(err, foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+listname);
        });
    }


});
app.post("/delete", function (req, res) {
    const checkitemid = req.body.checkbox;
    const listname = req.body.listname;
    if(listname==="Today"){
        Item.findByIdAndRemove(req.body.checkbox, function (err) {
            if (!err) {
                console.log("succsessfully deleted");
                res.redirect("/");
            }
            
        });
    }
    else {
        List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: checkitemid}}}, function(err, foundlist){
            if(!err){
                res.redirect("/"+listname);
            }
        });
    }
    



});

let port = process.env.PORT;
if(port==null || port==""){
    port=3000;
}
app.listen(port, function () {
    console.log("server started ");
});