const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof (o) == "string") && (/^[0-9]+$/.test(o))) {
        return BigInt(o);
    } else if ((typeof (o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o))) {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o === null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // Generate proof and public signals with groth16
        const { proof, publicSignals } = await groth16.fullProve({ "a": "1", "b": "2" }, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm", "contracts/circuits/HelloWorld/circuit_final.zkey");

        // Turn string in publicSignals and proof into big numbers
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // Export solidity call data for calling verifier contract later
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        // Process calldata and generate arguments for verifyProof
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // Check if verifyProof is true for correct proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Groth16Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        // Generate proof and public signals with groth16
        const { proof, publicSignals } = await groth16.fullProve({ "a": "1", "b": "2", "c": "3" }, "contracts/circuits/Multiplier3Groth16/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3Groth16/circuit_final.zkey");

        // Turn string in publicSignals and proof into big numbers
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // Export solidity call data for calling verifier contract later
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        // Process calldata and generate arguments for verifyProof
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // Check if verifyProof is true for correct proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        // Generate proof and public signals with groth16
        const { proof, publicSignals } = await plonk.fullProve({ "a": "1", "b": "2", "c": "3" }, "contracts/circuits/Multiplier3Plonk/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3Plonk/circuit_final.zkey");

        // Turn string in publicSignals and proof into big numbers
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        // Export solidity call data for calling verifier contract later
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        // Process calldata and generate arguments for verifyProof
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');

        // Check if verifyProof is true for correct proof
        expect(await verifier.verifyProof(argv[0], [argv[1]])).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let fakeProofs = ethers.utils.shuffled([0]);
        let fakeSignals = [0]
        expect(await verifier.verifyProof(fakeProofs, fakeSignals)).to.be.false;
    });
});