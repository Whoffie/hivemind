import express from "express"
import sql from "mysql"
import "dotenv/config"

function getSeason() { // remember .getMonth() ranges from 0-11, not 1-12
  let now = new Date()

  if (now.getMonth() > 9 && now.getMonth() < 3) { // determine Winter
    return 0
  }else if (now.getMonth() > 8 && now.getMonth() < 10) { // determine Fall
    return 1
  }else if (now.getMonth() > 3 && now.getMonth() < 6) { // determine Spring
    return 2
  }else if (now.getMonth() >= 6 && now.getMonth() < 8) { // determine Summer
    return 3
  }
}

const con = sql.createConnection({
  host: process.env.DB_HOST,
  user: "will",
  password: process.env.DB_PASSWORD,
  database: "hive"
})

con.connect()

const app = express()

app.set("view engine", "hbs")
app.use(express.static("views"))
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
  con.query("SELECT `temperature`, `humidity`, `time` FROM `data` ORDER BY `id` DESC LIMIT 24", (err, result) => {
    let temperatures = []

    for (let i = 0; i < result.length; i++) {
      temperatures.push(result[i])
    }

    temperatures = temperatures.reverse()

    if (getSeason() == 0) { // these temp minimums are very much subject to change
      if (temperatures[temperatures.length - 1].temperature > 30) { // fetch last temp reading
        var tempstatus = true
      }else {
        var tempstatus = false
      }
    }

    if (getSeason() == 1) {
      if (temperatures[temperatures.length - 1].temperature > 50) {
        var tempstatus = true
      }else {
        var tempstatus = false
      }
    }

    if (getSeason() == 2) {
      if (temperatures[temperatures.length - 1].temperature >= 90 && temperatures[temperatures.length - 1].temperature < 100) {
        var tempstatus = true
      }else {
        var tempstatus = false
      }
    }

    if (getSeason() == 3) {
      if (temperatures[temperatures.length - 1].temperature > 90 && temperatures[temperatures.length - 1].temperature < 100) {
        var tempstatus = true
      }else {
        var tempstatus = false
      }
    }

    if (temperatures[temperatures.length - 1].humidity >= 50 && temperatures[temperatures.length - 1].humidity <= 60) {
      var humiditystatus = true
    }else {
      var humiditystatus = false
    }

    res.render("dashboard", {temperatures: temperatures, tempstatus: tempstatus, humiditystatus: humiditystatus})
  })
})

app.listen(3000, () => {
  console.log("Server is Running!");
})
