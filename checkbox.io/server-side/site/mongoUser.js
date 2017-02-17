use site 
db.createUser(
  {
    user: "mongoAdmin",
    pwd: "password",
    roles: [ { role: "readWrite", db: "site" } ]
  }
)
