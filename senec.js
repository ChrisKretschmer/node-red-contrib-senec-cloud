const SenecAPI = require("./senecAPI.js");

module.exports = function (RED) {
  class SenecNode {

    constructor(config) {
      RED.nodes.createNode(this, config);
      this.username = this.credentials.username;
      this.password = this.credentials.password;
      this.config = config;

      this.api = new SenecAPI();
      this.on("input", this.onInput.bind(this));

    }

    async onInput (msg) {
      try {
        const loginCookie = await this.api.makeLoginRequest(this.username, this.password);
        const result = await this.api.makeDataRequest(loginCookie, this.config.url);
        msg.payload = result;
        this.send(msg);
        this.setStatus(true);
      } catch (ex) {
        this.setStatus(false, ex);
      }
    }

    setStatus(ok, message) {
      let status;
      if (ok) {
        status = {
          fill: "green",
          shape: "dot",
          text: "OK"
        };
      } else {
        status = {
          fill: "red",
          shape: "ring",
          text: message
        };
      }
      this.status(status);
    }
  }

  RED.nodes.registerType("senec", SenecNode, {
    credentials: {
      username: { type: "text" },
      password: { type: "password" },
    }
  });
};