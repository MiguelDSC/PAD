/**
 * Server application - contains all server config and api endpoints
 *
 * @author Pim Meijer
 */
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require("./utils/databaseHelper");
const cryptoHelper = require("./utils/cryptoHelper");
const corsConfig = require("./utils/corsConfigHelper");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
app.use(bodyParser.json({limit: '10000mb', extended: true}))
//logger lib  - 'short' is basic logging info
app.use(morgan("short"));

//init mysql connectionpool
const connectionPool = db.init();

//parsing request bodies from json to javascript objects
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS config - Cross Origin Requests
app.use(corsConfig);
//File uploads
app.use(fileUpload());

// ------ ROUTES - add all api endpoints here ------
const httpOkCode = 200;
const badRequestCode = 400;
const authorizationErrCode = 401;

app.post("/user/login", (req, res) => {
    const username = req.body.username;

    //TODO: We shouldn't save a password unencrypted!! Improve this by using cryptoHelper :)
    const password = req.body.password;
    const hashed_password = cryptoHelper.getHashedPassword(password);

    db.handleQuery(connectionPool, {
        query: "SELECT `username`, `password`, `id`, `role` FROM user WHERE username = ? AND password = ?",
        values: [username, hashed_password]
    }, (data) => {
        if (data.length === 1) {
            //return just the username for now, never send password back!
            res.status(httpOkCode).json({"username": data[0].username, "role": data[0].role, "userID": data[0].id});
        } else {
            //wrong username
            res.status(authorizationErrCode).json({reason: "Wrong username or password"});
        }

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

// Update a rehabilsdjfsdjf
app.post("/user/update", (req, res) => {
    let firstname = req.body.editValues[0].firstname;
    let lastname = req.body.editValues[0].lastname;
    let birthdate = req.body.editValues[0].birthdate;
    let gender = req.body.editValues[0].gender;
    let bloodtype = req.body.editValues[0].bloodtype;
    let status = req.body.editValues[0].status;
    let phone = req.body.editValues[0].phone;
    let email = req.body.editValues[0].email;
    let description = req.body.editValues[0].description;
    let adres = req.body.editValues[0].adres;
    let postcode = req.body.editValues[0].postcode;

    // Put all the values in a big array we can send back to update the site without reload!
    let values = [];
    values.push({
        "firstname": firstname,
        "lastname": lastname,
        "birthdate": birthdate,
        "gender": gender,
        "bloodtype": bloodtype,
        "status": status,
        "phone": phone,
        "email": email,
        "description": description,
        "adres": adres,
        "postcode": postcode,
        "id": req.body.id
    });

    console.log(req.body.userValues);
    if (req.body.userValues[1] != "") {
        db.handleQuery(connectionPool, {
            query: "UPDATE `rehabilitator` SET `first_name` = ?, `last_name` = ?, `birthdate` = ?, `gender` = ?, `bloodtype` = ?, `status` = ?, `phonenumber` = ?, `email` = ?, `description` = ?, `adress` = ?, `postalcode` = ? WHERE `id` = ?;" +
                "UPDATE `user` SET `username` = ?, `password` = ? WHERE `id` = ?",
            values: [firstname, lastname, birthdate, gender, bloodtype, status, phone, email, description, adres, postcode, req.body.id, req.body.userValues[0],
                cryptoHelper.getHashedPassword(req.body.userValues[1]), req.body.userValues[2]]
        }, (data) => {

            res.status(httpOkCode).json({"values": values});
        }, (err) => res.status(badRequestCode).json({"reason": err}));
    } else {
        db.handleQuery(connectionPool, {
            query: "UPDATE `rehabilitator` SET `first_name` = ?, `last_name` = ?, `birthdate` = ?, `gender` = ?, `bloodtype` = ?, `status` = ?, `phonenumber` = ?, `email` = ?, `description` = ?, `adress` = ?, `postalcode` = ? WHERE `id` = ?;" +
                "UPDATE `user` SET `username` = ? WHERE `id` = ?",
            values: [firstname, lastname, birthdate, gender, bloodtype, status, phone, email, description, adres, postcode, req.body.id, req.body.userValues[0],
                req.body.userValues[2]]
        }, (data) => {

            res.status(httpOkCode).json({"values": values});
        }, (err) => res.status(badRequestCode).json({"reason": err}));
    }
})

// Delete a patient
app.post("/user/delete", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "DELETE FROM `rehabilitator` WHERE `id` = ?; DELETE FROM `user` WHERE `id` = ?",
        values: [req.body.id, req.body.userID]
    }, (data) => {
        res.status(httpOkCode).json({"data": data});
    }, (err) => res.status(badRequestCode).json({"reason": err}))
});

// add a patient
app.post("/user/addRehab", (req, res) => {
    let firstname = req.body.editValues[0].firstname;
    let lastname = req.body.editValues[0].lastname;
    let birthdate = req.body.editValues[0].birthdate;
    let gender = req.body.editValues[0].gender;
    let bloodtype = req.body.editValues[0].bloodtype;
    let status = req.body.editValues[0].status;
    let phone = req.body.editValues[0].phone;
    let email = req.body.editValues[0].email;
    let description = req.body.editValues[0].description;
    let adres = req.body.editValues[0].adres;
    let postcode = req.body.editValues[0].postcode;

    let values = [];
    values.push({
        "firstname": firstname,
        "lastname": lastname,
        "birthdate": birthdate,
        "gender": gender,
        "bloodtype": bloodtype,
        "status": status,
        "phone": phone,
        "email": email,
        "description": description,
        "adres": adres,
        "postcode": postcode
    })

    db.handleQuery(connectionPool, {
        query: "INSERT INTO `rehabilitator` (`first_name`, `last_name`, `birthdate`, `gender`, `bloodtype`, `status`, `phonenumber`, `email`, `description`, `adress`, `postalcode`, `caretaker_id`, `user_id`)" +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        values: [firstname, lastname, birthdate, gender, bloodtype, status, phone, email, description, adres, postcode, req.body.caretakerId, req.body.userID]
    }, (data) => {
        res.status(httpOkCode).json({"data": data, "values": values});
    }, (err) => res.status(badRequestCode).json({"reason": err}))
})

// add an user
app.post("/user/addUser", (req, res) => {
    let crypted = cryptoHelper.getHashedPassword(req.body.userValues[1]);
    console.log(crypted);
    db.handleQuery(connectionPool, {
        query: "INSERT INTO `user` (`username`, `password`, `role`) VALUES (?, ?, ?)",
        values: [req.body.userValues[0], crypted, 0]
    }, (result) => {
        res.status(httpOkCode).json({"data": result});
    }, (err) => res.status(badRequestCode).json({"reason": err}));
})

//retrieve rehabilitator info
app.post("/user/rehabilitator", (req, res) => {
    db.handleQuery(connectionPool, {
        // query: "SELECT `first_name`,`last_name`,`Birthdate`,`Description`,`Adress`,`Postalcode`, `Bloodtype`, `Gender`, `foto` from `rehabilitator` WHERE user_ID = ?",
        query: "SELECT `r`.* , `u`.`photo` from `rehabilitator` `r` INNER JOIN `user` `u` on `u`.`id` = `r`.`user_id` WHERE `u`.`id` = ?",
        values: [req.body.id]
    }, (data) => {
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});
app.post("/user/photo", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT user.photo FROM user WHERE user.id = ?",
        values: [req.body.id]
    }, (data) => {
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//retrieve caretaker info
app.post("/user/caretaker", (req, res) => {
    console.log(req.body.id)
    db.handleQuery(connectionPool, {
        query: "SELECT caretaker.caretaker_id, caretaker.first_name, caretaker.last_name, caretaker.email, caretaker.phone, caretaker.description, caretaker.experience_field1, caretaker.experience_field2, caretaker.experience_field3 FROM caretaker INNER JOIN rehabilitator ON rehabilitator.caretaker_id = caretaker.caretaker_id WHERE rehabilitator.user_id = ?",
        values: [req.body.id]
    }, (data) => {
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

// retrieve caretaker info WITH caretaker logged in
app.post("/caretaker/getInfo", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT * FROM `caretaker` WHERE `caretaker`.`user_id` = ?",
        values: [req.body.userID]
    }, (data) => {
        res.send(data)
    }, (err) => res.status(badRequestCode).json({reason: err}));
})

// Save the caretaker
app.post("/caretaker/saveInfo", (req, res) => {
    console.log(req.body.values[0].firstname);
    let firstname = req.body.values[0].firstname;
    let lastname = req.body.values[0].lastname;
    let email = req.body.values[0].email;
    let description = req.body.values[0].description;
    let phone = req.body.values[0].phone;
    let experience_one = req.body.values[0].experience_one;
    let experience_two = req.body.values[0].two;
    let experience_three = req.body.values[0].experience_three;

    db.handleQuery(connectionPool, {
        query: "UPDATE `caretaker` SET `first_name` = ?, `last_name` = ?, `email` = ?, `phone` = ?, `description` = ?, `experience_field1` = ?, `experience_field2` = ?, `experience_field3` = ? WHERE `user_id` = ?",
        values: [firstname, lastname, email, phone, description, experience_one, experience_two, experience_three, req.body.userID]
    }, (data) => {
        res.send(data)
    }, (err) => res.status(badRequestCode).json({reason: err}));
})

//retrieve messages
app.post("/messages", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT message.message_id, message.content, message.message_id, message.date, message.rehabilitator_id, rehabilitator.first_name, rehabilitator.birthdate FROM message INNER JOIN rehabilitator ON message.rehabilitator_id = rehabilitator.id WHERE message.message_id NOT IN (SELECT message_has_report.message_id FROM message_has_report WHERE message_has_report.rehabilitator_id = ?)",
        values: [req.body.rehabilitatorID]
    }, (data) => {
        console.log(data)
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//retrieve my messages
app.post("/messages/me", (req, res) => {
    console.log(req.body)
    db.handleQuery(connectionPool, {
        query: "SELECT message.content, message.message_id, message.date FROM message INNER JOIN rehabilitator ON message.rehabilitator_id = rehabilitator.id where rehabilitator_id = ?",
        values: [req.body.userID]
    }, (data) => {
        console.log(data)
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//delete message
app.post("/messages/delete", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "DELETE FROM message WHERE message_id = ?;",
        values: [req.body.messageID]
    }, (data) => {
        console.log(data)
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//insert messages
app.post("/messages/insert", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "INSERT INTO message(caretaker_id, rehabilitator_id, content, date) VALUES (?, ?, ?, ?);",
        values: [req.body.caretakerID, req.body.userID, req.body.message, req.body.date]
    }, (data) => {
        console.log(data)
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//report message
app.post("/messages/report", (req, res) => {
    const {messageID, rehabilitatorID} = req.body;

    const handleErr = (err, requestCode = badRequestCode) => res.status(requestCode).json({reason: err});

    console.log(req.body)
    db.handleQuery(connectionPool, {
        //report message in message_has_report
        query: "INSERT INTO message_has_report (message_id, rehabilitator_id) VALUES (?, ?);",
        values: [messageID, rehabilitatorID]
    }, (reportData) => {
        console.log(reportData)
        //get amount of reports back
        db.handleQuery(connectionPool, {
            query: "SELECT COUNT(message_id) messageCount FROM message_has_report where message_id = ?;",
            values: [messageID]
        }, (countData) => {
            const messageCount = +countData[0].messageCount;
            //handle delete
            if (messageCount >= 3) {
                db.handleQuery(connectionPool, {
                    query: "DELETE message, message_has_report FROM message INNER JOIN message_has_report WHERE message.message_id = message_has_report.message_id and message.message_id = ?;",
                    values: [messageID]
                }, () => {
                }, deleteErr => handleErr(deleteErr))
            }

            res.send(reportData)
        }, (countErr) => handleErr(countErr))

    }, reportErr => handleErr(reportErr));
});


app.post("/pam", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `id` from `rehabilitator` WHERE user_id = ?",
        values: [req.body.id]
    }, (data) => {
        db.handleQuery(connectionPool, {
            query: "SELECT `quarterly_score` , `date` from `pam_score` WHERE rehabilitator_id = ?",
            values: [data[0]['id']]
        }, (datapam) => {
            res.send(datapam)
        }, (err) => res.status(badRequestCode).json({reason: err}));

    }, (err) => res.status(badRequestCode).json({reason: err}));

});
// Get pam score from user
app.post("/pam/score", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `pam_score` FROM `pam_score` WHERE `rehabilitator_id` = ? ORDER BY `date` DESC LIMIT 1;",
        values: [req.body.id]
    }, (data) => {
        console.log(data);
        res.send(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

// Get all pam score from user
app.post("/pam/allscore", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT SUM(`pam_score`) AS `total_score` FROM `pam_score` WHERE `rehabilitator_id` = ?",
        values: [req.body.id]
    }, (data) => {
        console.log(data);
        res.send(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

app.post("/caretaker/all", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `r`.* FROM `rehabilitator` as `r` INNER JOIN `caretaker` as `c` on `r`.`caretaker_id` = `c`.`caretaker_id` INNER JOIN `user` as `u` on `u`.`id` = `c`.`user_id` WHERE `u`.`id` = ?",
        values: [req.body.userID]
    }, (data) => {
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
})


app.post("/rehabilitator/activities", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT * from `pam_activity` WHERE ? BETWEEN daily_pam_min AND daily_pam_max ORDER BY id ASC ",
        values: [req.body.daily]
    }, (activityData) => {
        res.send(activityData)
    }, (err) => res.status(badRequestCode).json({reason: err}));
});

app.post("/rehabilitator/goal/total", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `pam_goal_total` from `rehabilitator` WHERE user_id = ?",
        values: [req.body.id]
    }, (data) => {
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

app.post("/rehabilitator/goal/date", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `appointment_date` from `rehabilitator` WHERE user_id = ?",
        values: [req.body.id]
    }, (data) => {
        res.send(data)

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

app.post("/rehabilitator/appointment", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `appointment_date`, `pam_goal_total` from `rehabilitator` WHERE `id` = ?",
        values: [req.body.id]
    }, (data) => {
        res.send(data)
    }, (err) => res.status(badRequestCode).json({reason: err}));
});

app.post("/rehabilitator/appointment/update", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "UPDATE `rehabilitator` SET `appointment_date` = ?, `pam_goal_total` = ?, `initial_daily_goal` = ? WHERE `id` = ?;",
        values: [req.body.appointment_date,req.body.pam_goal_total,req.body.initial_daily_goal,req.body.id]
    }, (data) => {
        res.status(httpOkCode);
    }, (err) => res.status(badRequestCode).json({"reason": err}));
});

// Get data from user
app.post("/user/data", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `p`.`pam_score`, `p`.`date`, `p`.`quarterly_score` FROM `pam_score` as `p` INNER JOIN `rehabilitator` as `r` on `r`.`id` = `p`.`rehabilitator_id` WHERE `r`.`user_id` = ?",
        values: [req.body.id]
    }, (data) => {
        console.log(data);
        res.send(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

//get total goal and daily goal for motivational text home screen
app.post("/pam/goal", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `initial_daily_goal`, `pam_goal_total`, `appointment_date` FROM `rehabilitator` WHERE `user_id` = ?",
        values: [req.body.id]
    }, (data) => {
        console.log(data);
        res.send(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
});

app.post("/caretaker/all", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `r`.* FROM `rehabilitator` as `r` INNER JOIN `caretaker` as `c` on `r`.`caretaker_id` = `c`.`caretaker_id` INNER JOIN `user` as `u` on `u`.`id` = `c`.`user_id` WHERE `u`.`id` = ?",
        values: [req.body.userID]
    }, (data) => {
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
})

// get caretaker id
app.post("/caretaker/getId", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `caretaker`.`caretaker_id` FROM `caretaker` INNER JOIN `user` ON `user`.id = `caretaker`.`user_id` WHERE `user`.id = ?",
        values: [req.body.userID]
    }, (data) => {
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}));
})

// get all usernames and passwords of users for the rehab
app.post("/caretaker/user", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT `u`.`username`, `u`.`password`, `u`.`id` FROM `user` AS `u` WHERE `u`.`id` = ?",
        values: [req.body.userID]
    }, (data) => {
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}));
});

app.get("/caretaker/all/pagination", (req, res) => {
    const maxPerPagination = req.query.amountPerPage;
    const currentPaginationOffset = (req.query.paginationPosition - 1) * maxPerPagination;

    db.handleQuery(connectionPool, {
        query: "SELECT r.* FROM rehabilitator as r INNER JOIN caretaker as c on r.caretaker_id = c.caretaker_id INNER JOIN user as u on u.id = c.user_id WHERE u.id = ? LIMIT ? OFFSET ?",
        values: [req.query.userID, parseInt(maxPerPagination), currentPaginationOffset]
    }, (data) => {
        console.log(data)
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}))
})

app.get("/caretaker/all/count", (req, res) => {
    console.log(req.query.userID)
    db.handleQuery(connectionPool, {
        query: "SELECT Count(*) as `count` FROM `rehabilitator` as `r` INNER JOIN `caretaker` as `c` on `r`.`caretaker_id` = `c`.`caretaker_id` INNER JOIN `user` as `u` on `u`.`id` = `c`.`user_id` WHERE `u`.`id` = ?",
        values: [req.query.userID]
    }, (data) => {
        res.status(httpOkCode).json(data);
    }, (err) => res.status(badRequestCode).json({reason: err}));
})

app.post("/user/uploader", function (req, res) {
    let randomString = Math.random().toString(36).substring(7)

    var data = req.body.data.replace(/^data:image\/\w+;base64,/, '');
    const fileImage = randomString + ".png";

    fs.writeFile(wwwrootPath + "/" + fileImage, data, {encoding: 'base64'}, function (err) {
    });

    //check if stored photo exist in database
    db.handleQuery(connectionPool, {
        query: "SELECT `user`.`photo` FROM `user` WHERE `id` = ?",
        values: [req.body.id]
    }, (data) => {
        if (data[0]['photo'] != null) {
            try {
                fs.unlinkSync(wwwrootPath + "/" + data[0]['photo'])
                //file removed
            } catch (err) {
                console.error(err)
            }
        }
        //change the photo name to the photo random name
        db.handleQuery(connectionPool, {
            query: "UPDATE `user` SET `photo` = ? WHERE `id` = ?",
            values: [fileImage, req.body.id]
        }, (data) => {
            res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json({reason: err}))
    }, (err) => res.status(badRequestCode).json({reason: err}))


});


//------- END ROUTES -------

module.exports = app;

