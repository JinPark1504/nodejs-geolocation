const request = require('request');

// function geocode(uri, callback) {
//     request({
//         uri: uri,
//         json: true,
//     }, (err, resp, body) => {
//         if(err) {
//             // console.log(err);
//             callback(err);
//         } else if(body.results[0] != undefined) {
//             // console.log(body.results[0].formatted_address);
//             // console.log(body.results[0].geometry.location.lat);
//             // console.log(body.results[0].geometry.location.lng);
//             callback(undefined, body.results[0]);
//         } else if(body.status === 'ZERO_RESULTS') {
//             // console.log('No data')
//             callback('No Data');
//         } else if(body.status === 'OVER_QUERY_LIMIT') {
//             console.log('over_query_limit');
//             setTimeout(() => {
//                 geocode(uri, callback);
//             }, 3000);
//         } else {
//             // console.log('body.status: ', body.status);
//             callback(`body.status: ${body.status}`);
//         }
//     });
// }

const geocode = uri => {
    return new Promise((resolve, reject) => {
        request({
            uri: uri,
            json: true,
        }, (err, resp, body) => {
            if(err) {
                reject(err);
            } else if(body.results[0] != undefined) {
                resolve(body.results[0]);
            } else if(body.status === 'ZERO_RESULTS') {
                reject('No Data');
            } else if(body.status === 'OVER_QUERY_LIMIT') {
                console.log('over_query_limit');
                setTimeout(() => {
                    geocode(uri);
                }, 3000);
            } else {
                // console.log('body.status: ', body.status);
                reject(`body.status: ${body.status}`);
            }
        });        
    })
}
module.exports = geocode;