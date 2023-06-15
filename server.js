import express from "express"
import sql from "mysql"

con = sql.createConnection({
  host: "localhost",
  user: "will",
  password: "sup3rs3cr3tp4assw0rd",
  database: "hive"
})

con.connect()

const app = express()

app.use(express.json())
app.use(express.static("public"))

app.get("/hive/", (req, res) => {
  if (!req.query.temperature || !req.query.humidity) {
    res.send("Invalid request")
  }else {
    let stmt = "INSERT INTO `hive` (`temperature`, `humidity`, `date`, `time`) VALUES (`?`, `?`, `?`, `?`)"
    let current = new Date()

    let date = current.getMonth() + "/" + current.getDay() + "/" + current.getFullYear()
    let time = current.getHours() + ":" + current.getMinutes()

    con.query(stmt, [req.query.temperature, req.query.humidity, date, time], (err) => {
      if (err) {
        res.send(err)
      }else {
        res.send("Success.")
      }
    })
  }
})

app.listen(3000, () => {
  console.log("Server is Running!");
});