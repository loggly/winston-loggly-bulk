const winston = require("winston");
module.exports.testLevels = function(transport, assertMsg, assertFn) {
  var tests = {};
  const levels = winston.config.npm.levels;

  Object.keys(levels).forEach(function(level) {
    var test = {
      topic: function() {
        transport.log({ level, message: "test message" }, this.callback);
      }
    };

    test[assertMsg] = assertFn;
    tests["with the " + level + " level"] = test;
  });

  var metadatatest = {
    topic: function() {
      transport.log(
        { level: "info", message: "test message meta boolean", Metadata: true },
        this.callback
      );
    }
  };

  metadatatest[assertMsg] = assertFn;
  tests["when passed metadata"] = metadatatest;

  var primmetadatatest = {
    topic: function() {
      transport.log("metadata", this.callback);
    }
  };

  primmetadatatest[assertMsg] = assertFn;
  tests["when passed primitive metadata"] = primmetadatatest;

  var nummetadatatest = {
    topic: function() {
      transport.log(123456789, this.callback);
    }
  };

  nummetadatatest[assertMsg] = assertFn;
  tests["when passed numeric metadata"] = nummetadatatest;

  return tests;
};
