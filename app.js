  const express = require("express");
  const bodyParser = require("body-parser");
  const ejs = require("ejs");
  const mongoose = require("mongoose");
  const _ = require("lodash");

  const app = express();

  app.set("view engine", "ejs");

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(express.static("public"));

  mongoose.connect("mongodb+srv://Admin-Arshad:ArshaD007@cluster0.spd21.mongodb.net/toDoListDB", {
    useNewUrlParser: true
  });

  const itemsSchema = {
    name: String
  };

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    name: "Buy Groceries"
  });
  const item2 = new Item({
    name: "Cook Food"
  });
  const item3 = new Item({
    name: "Eat The Food"
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);

  app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (!err) {
            console.log("Previous items are shown now")
          };
        });
        res.redirect("/");
      } else {
        res.render("lists", {
          listTitle: "Today",
          newListItems: foundItems
        });
      };
    });
  });




  app.get("/:customListName", function(req, res) {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
      name: customListName
    }, function(err, foundList) {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          res.render("lists", {
            listTitle: foundList.name,
            newListItems: foundList.items

          });
        }
      }
    });
  });


  app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
      name: itemName
    });

    if (listName === "Today") {
      newItem.save();
      res.redirect("/");

    } else {
      List.findOne({
        name: listName
      }, function(err, foundList) {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      });
    }

  });
  app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err) {
        if (!err) {
          console.log("Successfully Deconsted Checked Item");
          res.redirect("/");
        }

      });
    } else {
      List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      }, function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
    }
  });

  let port = process.env.PORT;

  if (port == null || port == "") {
    port = 1100;
  }



  app.listen(port, () => {
    console.log("Server is now running on Heroku");
  });
