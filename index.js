const express = require("express");
const cors = require("cors");

const { getUID, getPhoto } = require("./Services");

const server = express();
server.use(cors());

// expect to get some payload data directly from a client as a json object
// when you do, put them on req.body
server.use(express.json());

// expect to get some payload data directly from a form
// when you do, put them on req.body
server.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});

// database
const { db } = require("./Database");

// routes
// CRUD
// Create Read Update Delete
// POST    GET  PUT     DELETE

// GET / => db : READ operation
server.get("/", (req, res) => {
  const { location } = req.query;

  if (!location) return res.send(db);

  const locations = db.filter(
    (dest) => dest.location.toLowerCase() === location.toLowerCase()
  );

  return res.send(locations);
});

// POST / :CREATE operation
// expects {name, location, description?}
// before we create a destination in our db, we will get a photo of that destination from Unsplash
server.post("/", async (req, res) => {
  const { name, location, description } = req.body;

  if (!name || !location)
    return res.status(400).json({ error: "name and location are required" });

  // generate a random UID
  const uid = getUID();

  // get picture from Unsplash
  const photo = await getPhoto(name);

  db.push({
    uid,
    name,
    photo,
    location,
    description: description || "",
  });

  res.send({ uid });
});

// PUT /?uid :UPDATE operation
// localhost:3000?uid=123456
// prev {uid: "123456", name: "vegas", location:"nevada", description: ""}
// body {description: "go there for everything gambling"}
// expect {name, location, description?}
server.put("/", async (req, res) => {
  const { uid } = req.query;

  if (!uid || uid.length !== 6)
    return res.status(400).json({ error: "uid is a required 6 digit number" });

  const { name, location, description } = req.body;

  if (!name && !location && !description) {
    return res
      .status(400)
      .json({ error: "we need at least one property to update" });
  }

  let found = false;

  // go find a destination with the uid from my db
  for (let index = 0; index < db.length; index++) {
    const dest = db[index];

    if (dest.uid === uid) {
      // destination with uid found. update the dest with new information

      found = true;

      dest.description = description ? description : dest.description;
      dest.location = location ? location : dest.location;

      if (name) {
        // first get the photo and then update name and photo
        const photo = await getPhoto(name);

        dest.name = name;
        dest.photo = photo;
      }

      break;
    }
  }

  if (found) {
    return res.send({ status: "found and updated" });
  }

  return res.send({ status: "not found" });
});

// DELETE /?uid
server.delete("/", (req, res) => {
  const { uid } = req.query;

  if (!uid) return res.status(400).json({ error: "uid is required" });

  let found = false;
  for (let index = 0; index < db.length; index++) {
    const dest = db[index];

    if (dest.uid === uid) {
      found = true;
      db.splice(index, 1);
      break;
    }
  }

  if (found) return res.send({ status: "found and deleted" });

  return res.send({ status: "not found" });
});
