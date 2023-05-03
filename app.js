//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Mongoose connection
mongoose.connect("mongodb+srv://root:custom@cluster0.xw9uqab.mongodb.net/todolistDB");

// Create items Schema
const itemsSchema = new mongoose.Schema({
  name: String
});

// Create Item model
const Item = mongoose.model("Item", itemsSchema);

// Create new items
const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);






app.get("/", function (req, res) {

  // Find items
  Item.find({})
    .then((foundItems) => {

      if (foundItems.length === 0) {
        // Insert items
        Item.insertMany(defaultItems)
          .then(result => {
            console.log(result)
          })
          .catch(err => {
            console.log(err)
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }

    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    })
    .catch((err) => {
      console.log(err);
    })
});



app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
      })
  }

});


app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkItemId)
    .then(result => {
      console.log(result)
      res.redirect("/");
    }).catch(err => {
      console.log(err)
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}})
    .then((result) => {
      console.log(result)
      res.redirect("/" + listName);
    }) .catch((err) => {
      console.log(err)
    })
  }

 
});







app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
