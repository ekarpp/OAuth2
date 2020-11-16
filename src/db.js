const mariadb = require("mariadb");

module.exports =  class DB {
  constructor(info) {
    this.pool = mariadb.createPool(info);
  }

  error_handler(err) {
    console.log(err);
    return Promise.reject("database error");
  }

  insert_client(client_id) {
    return this.pool.query("INSERT INTO Client VALUES (?)", [ client_id ])
      .catch(this.error_handler);
  }

  insert_auth(code, id, expire) {
    return this.pool.query("INSERT INTO Auth VALUES (?, ?, ?)", [ code, id, expire ])
      .catch(this.error_handler);
  }

  exists_client(client_id) {
    return this.pool.query("SELECT client_id FROM Client WHERE client_id=?", [ client_id ])
      .then(rows => {return Promise.resolve(rows.length == 1)})
      .catch(this.error_handler);
  }
}
