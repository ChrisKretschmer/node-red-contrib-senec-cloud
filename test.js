const SenecAPI = require("./senecAPI.js");
const name = process.argv[1];
const pass = process.argv[2];

if (!name || !pass) {
  console.error(
    "Please provide your senec username as first parameter and password as second parameter"
  );
} else {
  (async () => {
    const api = new SenecAPI();
    const loginCookie = await api.makeLoginRequest(name, pass);
    const url =
      "https://mein-senec.de/endkunde/api/status/getstatusoverview.php?anlageNummer=0";
    const result = await api.makeDataRequest(loginCookie, url);

    console.log(result);
  })();
}
