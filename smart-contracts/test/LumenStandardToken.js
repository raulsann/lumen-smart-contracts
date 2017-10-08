'use strict';

const assertJump = require('./helpers/assertJump');
var StandardTokenMock = artifacts.require('./helpers/LumenStandardTokenMock.sol');

contract('LumenStandard', function(accounts) {

  let token;

  beforeEach(async function() {
    token = await StandardTokenMock.new(accounts[0], 100);
  });

  it('should return the correct totalSupply after construction', async function() {
    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply, 100);
  });

  it('should return the correct allowance amount after approval', async function() {
    let token = await StandardTokenMock.new();
    await token.approve(accounts[1], 100);
    let allowance = await token.allowance(accounts[0], accounts[1]);

    assert.equal(allowance, 100);
  });

  it('should return correct balances after transfer', async function() {
    let token = await StandardTokenMock.new(accounts[0], 100);
    await token.transfer(accounts[1], 100);
    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0, 0);

    let balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1, 100);
  });

  it('should throw an error when trying to transfer more than balance', async function() {
    let token = await StandardTokenMock.new(accounts[0], 100);
    try {
      await token.transfer(accounts[1], 101);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  it('should return correct balances after transfering from another account', async function() {
    let token = await StandardTokenMock.new(accounts[0], 100);
    await token.approve(accounts[1], 100);
    await token.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});

    let balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0, 0);

    let balance1 = await token.balanceOf(accounts[2]);
    assert.equal(balance1, 100);

    let balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance2, 0);
  });

  it('should throw an error when trying to transfer more than allowed', async function() {
    await token.approve(accounts[1], 99);
    try {
      await token.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});
      assert.fail('should have thrown before');
    } catch (error) {
      assertJump(error);
    }
  });

  describe('validating allowance updates to spender', function() {
    let preApproved;

    it('should start with zero', async function() {
      preApproved = await token.allowance(accounts[0], accounts[1]);
      assert.equal(preApproved, 0);
    })

    it('should increase by 50 then decrease by 10', async function() {
      await token.increaseApproval(accounts[1], 50);
      let postIncrease = await token.allowance(accounts[0], accounts[1]);
      // preApproved.plus(50).should.be.bignumber.equal(postIncrease);
      assert.equal(preApproved.plus(50).valueOf(), postIncrease, "it has not increased by 50");
      await token.decreaseApproval(accounts[1], 10);
      let postDecrease = await token.allowance(accounts[0], accounts[1]);
      // postIncrease.minus(10).should.be.bignumber.equal(postDecrease);
      assert.equal(postIncrease.minus(10).valueOf(), postDecrease, "it has not decreased by 10");
    })
  });

  it('should throw an error when trying to transfer to 0x0', async function() {
    let token = await StandardTokenMock.new(accounts[0], 100);
    try {
      let transfer = await token.transfer(0x0, 100);
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

  it('should throw an error when trying to transferFrom to 0x0', async function() {
    let token = await StandardTokenMock.new(accounts[0], 100);
    await token.approve(accounts[1], 100);
    try {
      let transfer = await token.transferFrom(accounts[0], 0x0, 100, {from: accounts[1]});
      assert.fail('should have thrown before');
    } catch(error) {
      assertJump(error);
    }
  });

});