/* eslint-disable no-undef */
const { assert } = require('chai');

describe('login with username and password', () => {

    beforeEach(async()=>{
        await browser.url('/api/users/logout');
    });
    
    it('successfully login when the password is correct', async () => {
        const username = 'testuser';
        const correctPassword = 'testtest';

        await browser.url('/login');
        await $('#username').setValue(username);
        await $('#password').setValue(correctPassword);
        await $('.btn').click();

        const currentUrl = await browser.getUrl();
        assert.equal(currentUrl, 'http://localhost:3001/dashboard');
    });

    it('fails to login when the password is wrong', async() => {
        const username = 'testuser';
        const wrongPassword = 'alalalalalla';

        await browser.url('/login');
        await $('#username').setValue(username);
        await $('#password').setValue(wrongPassword);
        await $('.btn').click();

        const currentUrl = await browser.getUrl();
        assert.equal(currentUrl, 'http://localhost:3001/login');
    });
});