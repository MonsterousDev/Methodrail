const db = require("./db.js");
module.exports = {
  getUser: (id) => db.getUser(id),
};
