"use strict";
const EventEmitter = require("events");
const Promise = require("bluebird");
const extend = require("./util/extend");

module.exports = function(dependencies) {
  const config = dependencies.config;
  const EndpointManager = dependencies.EndpointManager;

  function Connection (options) {
    if(false === (this instanceof Connection)) {
      return new Connection(options);
    }

    this._options = options;

    EventEmitter.call(this);
  }

  Connection.prototype = Object.create(EventEmitter.prototype);

  Connection.prototype.checkConnect = function checkConnect() {
    return new Promise( resolve => {
      this.config = config(this._options);
      this.endpointManager = new EndpointManager(this.config);
      this.endpointManager.on("wakeup", () => {
        while (this.queue.length > 0) {
          const stream = this.endpointManager.getStream();
          if (!stream) {
            return;
          }
          const resolve = this.queue.shift();
          resolve(stream);
        }
      });

      this.queue = [];

      this.endpointManager.createEndpoint();
      resolve();
    });
  }

  Connection.prototype.destroy = function destroy() {
    this.endpointManager.removeAllEnpoint();
  }

  Connection.prototype.pushNotification = function pushNotification(notification, recipients) {

    const notificationHeaders = notification.headers();
    const notificationBody = notification.compile();

    const send = device => {
      return new Promise( resolve => {
        const stream = this.endpointManager.getStream();
        if (!stream) {
          this.queue.push(resolve);
        } else {
          resolve(stream);
        }
      }).then( stream => {
        return new Promise ( resolve => {
          stream.setEncoding("utf8");

          stream.headers(extend({
            ":scheme": "https",
            ":method": "POST",
            ":authority": this.config.address,
            ":path": "/3/device/" + device,
          }, notificationHeaders));

          let status, responseData = "";
          stream.on("headers", headers => {
            status = headers[":status"];
          });

          stream.on("data", data => {
            responseData = responseData + data;
          });

          stream.on("end", () => {
            if (status === "200") {
              resolve({ device });
            } else {
              const response = JSON.parse(responseData);
              resolve({ deviceToken: device, status, error: response });
            }
          });
          stream.write(notificationBody);
          stream.end();
        });
      });
    };

    if (!Array.isArray(recipients)) {
      recipients = [recipients];
    }

    return Promise.all( recipients.map(send) ).then( responses => {
      let sent = [];
      let failed = [];

      responses.forEach( response => {
        if (response.status) {
          failed.push(response);
        } else {
          sent.push(response);
        }
      });
      return {sent, failed};
    });
  };

  return Connection;
};

