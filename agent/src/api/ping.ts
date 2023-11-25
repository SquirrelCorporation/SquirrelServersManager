import axios from "axios";
import URL_MASTER from "../config";

const pingApi = async () => {
  axios.get(`${URL_MASTER}/api/ping`)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
      throw new Error(`Master node connection failed, please check that master node URL \"${URL_MASTER}\" is correct`)
    });
}

export default pingApi;
