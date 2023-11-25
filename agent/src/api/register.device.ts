import fs from "fs";
import axios from "axios";
import URL_MASTER from "../config";

const retrieveOrRegisterDevice = async () => {
  let hostId;
  if (!fs.existsSync("hostid.txt")) {
  await axios.post(`${URL_MASTER}/api/devices`)
    .then(async response => {
      console.log(response.data);
      console.log(`Registering id ${response.data.data.id}`);
      fs.writeFile('hostid.txt', response.data.data.id, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
      });
      hostId = response.data.data.id;
    })
    .catch(error => {
      console.error(error);
      throw new Error("Registering to Master node failed")
    });
} else {
    console.log('Reading host id from file');
    let fileData = fs.readFileSync('hostid.txt',
      {encoding: 'utf8', flag: 'r'});
    if (fileData) {
      hostId = fileData;
    }
  }
  return hostId;
}

export default retrieveOrRegisterDevice;
