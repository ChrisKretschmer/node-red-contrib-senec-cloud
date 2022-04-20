const axios = require("axios");
const FormData = require("form-data");

class SenecAPI {
  extractCookie(headers) {
    return headers["set-cookie"][0].split(";")[0];
  }

  async makeLoginRequest(username, password) {
    const url = "https://mein-senec.de/auth/login";
    const data = new FormData();
    data.append("username", username);
    data.append("password", password);

    var config = {
      method: "post",
      url: url,
      withCredentials: true,
      maxRedirects: 0,
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };

    let result;
    try {
      await axios(config);
    } catch (redirectException) {
      // axios throws an exception if redirects happen and maxRedirects is 0 :(
      // this means, we need to use the response in the exception to get our cookie information and discard the rest
      if (redirectException.response.status != 302) throw result; // we only handle errors, if we got a redirect
      result = redirectException;
    }
    return this.extractCookie(result.response.headers); // first cookie in cookies array. Get only the cookie part
  }

  async makeDataRequest(loginCookie, url) {
    let redirectUrl = url;
    let result;
    let sessionCookie;
    let final;

    while (redirectUrl != null) {
      try {
        const config = { maxRedirects: 0, headers: {}, withCredentials: true };
        if (redirectUrl.startsWith("https://mein-senec.de/auth")) {
          config.headers.Cookie = loginCookie;
        } else if (sessionCookie) {
          config.headers.Cookie = sessionCookie;
        }

        final = await axios.get(redirectUrl, config);
        if (final) {
          return final.data;
        }
      } catch (redirectException) {
        // axios throws an exception if redirects happen and maxRedirects is 0 :(

        if (redirectException.response.status != 302) throw result; // we only handle errors, if we got a redirect
        result = redirectException;
      }
      if (result.response.headers["set-cookie"]) {
        sessionCookie = this.extractCookie(result.response.headers);
      }
      if (result.response.headers.location) {
        if (redirectUrl === result.response.headers.location)
          throw "Got same URL as redirect target :/";
        redirectUrl = result.response.headers.location;
      } else {
        redirectUrl = null;
      }
      // if we get a redirect to /endkunde/, we got an authenticated session.
      // Its now time to request the original url manually (Don't ask me why)
      if (redirectUrl == "/endkunde/") redirectUrl = url;
    }
  }
}

module.exports = SenecAPI;
