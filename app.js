const request = require('request');
const yargs = require('yargs');
const fs = require('fs');

const argv = yargs
    .command('car', 'Car Info', {
        number: {
            describe: 'Car Plate Number',
            demand: true,
            alias: 'n'
        },
        model: {
            describe: 'Model name of a car',
            demand: true,
            alias: 'm'
        },
        owner: {
            describe: 'name of car owner',
            demand: true,
            alias: 'o'
        },
        year: {
            describe: 'the year of car made',
            demand: true,
            alias: 'y'
        }
    })
    .command('carlist', 'List of Cars', {
        number: {
            describe: 'Car Plate Number',
            alias: 'n'
        }
    })
    .command('gps', 'Current GPS Info.', {
        number: {
            describe: 'Car Plate Number',
            demand: true,
            alias: 'n'
        },
        latitude: {
            demand: true,
            describe: 'Latitude',
            alias: 't'
        },
        longitudue: {
            demand: true,
            describe: 'Longitude',
            alias: 'g'
        }
    })
    .command('address', 'Current Address Info', {
        number: {
            describe: 'Car Plate Number',
            demand: true,
            alias: 'n'
        },
        address: {
            demand: true,
            describe: 'Address',
            alias: 'a'
        }
    })
    .help()
    .argv;

// console.log(argv);
const arg1 = argv._[0];
const number = argv.number;

const fetchCar = () => {
    try {
        let list = fs.readFileSync('resources/car-list.json');
        return JSON.parse(list);
    } catch (error) {
        return [];
    }    
}

const fetchLoc = () => {
    try {
        return JSON.parse(fs.readFileSync('resources/location-records.json'));
    } catch (error) {
        return [];
    }
}

const saveCar = carList =>{
    fs.writeFileSync('resources/car-list.json', JSON.stringify(carList, undefined, 3));
}

const saveLocs = locs => {
    fs.writeFileSync('resources/location-records.json', JSON.stringify(locs, undefined, 3));
}

const timestamp = Date.now();

// get address from gps by geolocation.js
let uri = '';

const geocode = require('./js/geolocation.js');
const weather = require('./js/weather.js');

const locs = fetchLoc();

const tracking = (location, results) => {
    const weather = {
        summary: results.summary,
        temperature: results.temperature,
        humidity: results.humidity,
        windSpeed: results.windSpeed,
        uvIndex: results.uvIndex,
        visibility: results.visibility
    }
    // if the car exists on the list save the location
    locs.forEach( l => {
        if(l.number === number) {
            const loc = {
                timestamp,
                location,
                weather
            }
            l.info.push(loc);
            console.log('Saved:', l.info[l.info.length - 1]);
        }
    });

    saveLocs(locs);
}
const geolocation = () => {

    if(arg1 === 'gps') {
        const lat = argv.t;
        const lng = argv.g;
        uri = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}`;
    } else {
        const address = encodeURIComponent(argv.address);
        uri = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}`;
    }
    
    geocode(uri).then( (geoResults) => {
        // console.log('geoResults: ', geoResults);
            const location = {
                address: geoResults.formatted_address,
                latitude: geoResults.geometry.location.lat,
                longitude: geoResults.geometry.location.lng
            }
            // using callback
            // weather(location.latitude, location.longitude, (err, wResults) => {
            //     if(err) {
            //         console.log('errors: ', err);
            //     } else {
            //         console.log('time: ', wResults.time);

            //         tracking(location, wResults);
            //     }
            // });
            // using promise
            weather(location.latitude, location.longitude)
                .then( (wResults) => {
                    tracking(location, wResults);
                }).catch((err) => {
                    console.log('errors: ', err)
                });
    }).catch( (error) => {
        console.log(error);
    });
}
const carList = fetchCar();

if(arg1 === 'car') {
    const model = argv.model;
    const owner = argv.owner;
    const year = argv.year;
    
    // making list of cars
    const car = {
        number, model, owner, year
    }

    const locs = fetchLoc();
    
    const duplicatedCar = carList.filter( car => car.number === number);
    if(duplicatedCar.length === 0) {
        carList.push(car);
        // console.log(carList);
        saveCar(carList);
        console.log(carList);
        // checking if the car is on location-records
        const checkCar = locs.filter( loc => loc.number === number);
        if(checkCar.length === 0) {
            const addCar = {
                number,
                info: []
            }
            locs.push(addCar);
            saveLocs(locs);
            // console.log(locs);
        }
    } else {
        console.log("Duplicated car info! ", carList);
    }
} else if(arg1 === 'carlist') {
    if(argv.n) {
        const car = carList.filter( car => car.number === argv.n);
        if(car.length >= 1) {
            console.log(car);
        } else {
            const result = 'No car was matched to the number' + argv.n;
            console.log([{ result: result }]);
        }
    } else {
        console.log(carList);
    }
} else if(arg1 === 'gps' || arg1 === 'address') {
    const num = argv.number;
    // The car should be on car-list, notice
    const searchCar = carList.filter( car => car.number === num);
    if(searchCar.length > 0) {
        console.log('The car info exists on the list');
        geolocation();
    } else {
        console.log('The car info does not exist on the list');
    }
}