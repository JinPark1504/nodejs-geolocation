const request = require('request');


// const weather = (lat, lng, callback) => {
//     request({
//         uri: `https://api.darksky.net/forecast/cac1036b0a416fcb44efadba4292d443/${lat},${lng}`,
//         json: true
//     }, (err, resp, body) => {
//         if(err) {
//             callback(`errors in weather: ${err}`);
//         } else if(body.status === "ZERO_RESULTS") {
//             callback('There is no address matching your input.');
//         // } else if(body.status === "OVER_QUERY_LIMIT") {
//         //     console.log("The application is sending too many requests.");
//         //     setTimeout(() => {
//         //         weather(lat, lng, callback);
//         //     }, 3000);
//         } else {
//             callback(undefined, body.currently);
//         }
//     })
// };
const weather = (lat, lng) => {
    return new Promise( (resolve, reject) => {
        request({
                    uri: `https://api.darksky.net/forecast/cac1036b0a416fcb44efadba4292d443/${lat},${lng}`,
                    json: true
                }, (err, resp, body) => {
                    if(err) {
                        reject(`errors in weather: ${err}`);
                    } else if(body.status === "ZERO_RESULTS") {
                        reject('There is no address matching your input.');
                    // } else if(body.status === "OVER_QUERY_LIMIT") {
                    //     console.log("The application is sending too many requests.");
                    //     setTimeout(() => {
                    //         weather(lat, lng, callback);
                    //     }, 3000);
                    } else {
                        resolve(body.currently);
                    }
                })
    })
}

module.exports = weather;