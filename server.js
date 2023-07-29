import express from "express"
import sql from "mysql"
import "dotenv/config"

const con = sql.createConnection({
  host: "localhost",
  user: "will",
  password: process.env.DB_PASSWORD,
  database: "hive"
})

con.connect()

const app = express()

app.set("view engine", "hbs")
app.use(express.static("public"))
app.use(express.json())

app.get("/hive/", (req, res) => {
  if (!req.query.temperature || !req.query.humidity) {
    res.send("Invalid request")
  }else {
    let stmt = "INSERT INTO `data` (`temperature`, `humidity`, `date`, `time`) VALUES (?, ?, ?, ?)"
    let current = new Date()

    let date = current.getMonth() + 1 + "/" + current.getDate() + "/" + current.getFullYear()
    
    if (current.getMinutes() < 10) {
      let time = current.getHours() + ":0" + current.getMinutes()

      con.query(stmt, [req.query.temperature, req.query.humidity, date, time], (err) => {
        if (err) {
          res.send(err)
        }else {
          res.send("Success.")
        }
      })
    }else {
      let time = current.getHours() + ":" + current.getMinutes()

      con.query(stmt, [req.query.temperature, req.query.humidity, date, time], (err) => {
        if (err) {
          res.send(err)
        }else {
          res.send("Success.")
        }
      })
    }
  }
})

app.get("/dashboard", (req, res) => {
  res.render("dashboard")
})

app.listen(3000, () => {
  console.log("Server is Running!");
})