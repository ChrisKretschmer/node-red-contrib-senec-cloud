const SenecAPI = require("./senecAPI.js");

module.exports = function (RED) {
  function SenecNode(config) {
    RED.nodes.createNode(this, config);
    
    const username = this.credentials.username;
    const password = this.credentials.password;

    const node = this;
    const api = new SenecAPI();
    node.on("input", async function (msg) {
      const loginCookie = await api.makeLoginRequest(username, password);
      const result = await api.makeDataRequest(loginCookie, config.url);
      msg.payload = result;
      node.send(msg);
    });
  }
  RED.nodes.registerType("senec", SenecNode, {
    credentials: {
      username: { type: "text" },
      password: { type: "password" },
    }
  });
};