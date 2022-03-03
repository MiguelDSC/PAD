console.log("ingeladen")

const fs = require('fs');
const query = require("./utils/databaseHelper");
const config = require("./server.js");
const res = require("express");

fs.readFile('./random_generated.json', 'utf-8', (err, data) => {
    //initialize some variables
    let serieNummer
    let datum
    let kwartierScore
    let pamScore
    let datums = []

    //read json file
    data = JSON.parse(data)

    //loop through each pam serial number
    for (let nummer = 0; nummer < data.length; nummer++) {
        //get serial numbers
        serieNummer = data[nummer].pamnr

        const connectionPool = query.init();
        query.handleQuery(connectionPool, {
                query: "SELECT Serialnumber, Date FROM pam_score WHERE Serialnumber = ?",
                values: [serieNummer]
            }, (queryData) => {
                for (let loopDatum = 0; loopDatum < queryData.length; loopDatum++) {
                    datums.push(JSON.stringify(queryData[loopDatum].datum).substring(1, 11))
                }

                //loop through dates
                for (let dag = 0; dag < data[nummer].epochValues.length; dag++) {
                    //get datum
                    datum = data[nummer].epochValues[dag].date

                    if (datums.indexOf(datum) === -1) {
                        //get kwartier scores
                        kwartierScore = data[nummer].epochValues[dag].scores
                        kwartierScore = hex2bin(kwartierScore)

                        //get pam score
                        pamScore = data[nummer].todayValues[dag].values[0].pam


                        query.handleQuery(connectionPool, {
                                query: "INSERT INTO pam_score VALUES (0, ?, ?, ?, ?);",
                                values: [serieNummer, datum, pamScore, kwartierScore]
                            }, (data) => {
                            }, (err) => console.log("400")
                        );
                    }
                }
            }, (err) => res.status(400).json({reason: err})
        );


    }
})

//converts hexadecimal to binary
//copied from: https://stackoverflow.com/questions/45053624/convert-hex-to-binary-in-javascript
function hex2bin(hex) {
    hex = hex.replace("0x", "").toLowerCase();
    var out = "";
    for (var c of hex) {
        switch (c) {
            case '0':
                out += "0000";
                break;
            case '1':
                out += "0001";
                break;
            case '2':
                out += "0010";
                break;
            case '3':
                out += "0011";
                break;
            case '4':
                out += "0100";
                break;
            case '5':
                out += "0101";
                break;
            case '6':
                out += "0110";
                break;
            case '7':
                out += "0111";
                break;
            case '8':
                out += "1000";
                break;
            case '9':
                out += "1001";
                break;
            case 'a':
                out += "1010";
                break;
            case 'b':
                out += "1011";
                break;
            case 'c':
                out += "1100";
                break;
            case 'd':
                out += "1101";
                break;
            case 'e':
                out += "1110";
                break;
            case 'f':
                out += "1111";
                break;
            default:
                return "";
        }
    }

    return out;
}
