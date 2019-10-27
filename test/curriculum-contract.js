/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { CurriculumContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('CurriculumContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new CurriculumContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"curriculum 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"curriculum 1002 value"}'));
    });

    describe('#curriculumExists', () => {

        it('should return true for a curriculum', async () => {
            await contract.curriculumExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a curriculum that does not exist', async () => {
            await contract.curriculumExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createCurriculum', () => {

        it('should create a curriculum', async () => {
            await contract.createCurriculum(ctx, '1003', 'curriculum 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"curriculum 1003 value"}'));
        });

        it('should throw an error for a curriculum that already exists', async () => {
            await contract.createCurriculum(ctx, '1001', 'myvalue').should.be.rejectedWith(/The curriculum 1001 already exists/);
        });

    });

    describe('#readCurriculum', () => {

        it('should return a curriculum', async () => {
            await contract.readCurriculum(ctx, '1001').should.eventually.deep.equal({ value: 'curriculum 1001 value' });
        });

        it('should throw an error for a curriculum that does not exist', async () => {
            await contract.readCurriculum(ctx, '1003').should.be.rejectedWith(/The curriculum 1003 does not exist/);
        });

    });

    describe('#updateCurriculum', () => {

        it('should update a curriculum', async () => {
            await contract.updateCurriculum(ctx, '1001', 'curriculum 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"curriculum 1001 new value"}'));
        });

        it('should throw an error for a curriculum that does not exist', async () => {
            await contract.updateCurriculum(ctx, '1003', 'curriculum 1003 new value').should.be.rejectedWith(/The curriculum 1003 does not exist/);
        });

    });

    describe('#deleteCurriculum', () => {

        it('should delete a curriculum', async () => {
            await contract.deleteCurriculum(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a curriculum that does not exist', async () => {
            await contract.deleteCurriculum(ctx, '1003').should.be.rejectedWith(/The curriculum 1003 does not exist/);
        });

    });

});