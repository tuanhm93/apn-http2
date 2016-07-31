var loadCredentials = require("../../lib/credentials/load");
var fs = require("fs");

describe("loadCredentials", function() {
	var pfx, cert, key;
	before(function () {
		pfx = fs.readFileSync("test/support/initializeTest.pfx");
		cert = fs.readFileSync("test/support/initializeTest.crt");
		key = fs.readFileSync("test/support/initializeTest.key");
	});

	it("should load a pfx file from disk", function () {
		return expect(loadCredentials({ pfx: "test/support/initializeTest.pfx" })
				  .pfx.toString()).to.equal(pfx.toString());
	});

	it("should provide pfx data from memory", function () {
		return expect(loadCredentials({ pfx: pfx }).pfx.toString())
				  .to.equal(pfx.toString());
	});

	it("should provide pfx data explicitly passed in pfxData parameter", function () {
		return expect(loadCredentials({ pfxData: pfx }).pfx.toString())
				  .to.equal(pfx.toString());
	});

	it("should load a certificate from disk", function () {
		return expect(loadCredentials({ cert: "test/support/initializeTest.crt", key: null})
				  .cert.toString()).to.equal(cert.toString());
	});

	it("should provide a certificate from a Buffer", function () {
		return expect(loadCredentials({ cert: cert, key: null}).cert.toString())
          .to.equal(cert.toString());
	});

	it("should provide a certificate from a String", function () {
		return expect(loadCredentials({ cert: cert.toString(), key: null}).cert)
				  .to.equal(cert.toString());
	});

	it("should provide certificate data explicitly passed in the certData parameter", function () {
		return expect(loadCredentials({ certData: cert, key: null}).cert.toString())
				  .to.equal(cert.toString());
	});

	it("should load a key from disk", function () {
		return expect(loadCredentials({ cert: null, key: "test/support/initializeTest.key"})
				  .key.toString()).to.equal(key.toString());
	});

	it("should provide a key from a Buffer", function () {
		return expect(loadCredentials({ cert: null, key: key}).key.toString())
				  .to.equal(key.toString());
	});

	it("should provide a key from a String", function () {
		return expect(loadCredentials({ cert: null, key: key.toString()}).key)
				  .to.equal(key.toString());
	});

	it("should provide key data explicitly passed in the keyData parameter", function () {
		return expect(loadCredentials({ cert: null, keyData: key}).key.toString())
				  .to.equal(key.toString());
	});

	it("should load a single CA certificate from disk", function () {
		return expect(loadCredentials({ cert: null, key: null, ca: "test/support/initializeTest.crt" })
				  .ca[0].toString()).to.equal(cert.toString());
	});

	it("should provide a single CA certificate from a Buffer", function () {
		return expect(loadCredentials({ cert: null, key: null, ca: cert }).ca[0].toString())
				  .to.equal(cert.toString());
	});

	it("should provide a single CA certificate from a String", function () {
		return expect(loadCredentials({ cert: null, key: null, ca: cert.toString() }).ca[0])
				  .to.equal(cert.toString());
	});

	it("should load an array of CA certificates", function () {
    const certString = cert.toString();
		return expect(loadCredentials({ cert: null, key: null,
            ca: ["test/support/initializeTest.crt", cert, certString]
          }).ca.map( cert => cert.toString() ))
			.to.deep.equal([certString, certString, certString]);
	});

	it("returns undefined if no CA values are specified", function() {
		return expect(loadCredentials({ cert: null, key: null, ca: null}).ca)
      .to.be.undefined;
	});
	
	it("should inclue the passphrase in the resolved value", function() {
		return expect(loadCredentials({ passphrase: "apntest" }).passphrase)
			.to.equal("apntest");
	});
});
