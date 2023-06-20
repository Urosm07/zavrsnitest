"use strict";

const { By } = require('selenium-webdriver');
const BasePage = require('./base.page');

module.exports = class LoginPage extends BasePage {

    goToPage() {
        this.driver().get('http://shop.qa.rs/login');
    }

    getInputUsername() {
        return this.driver().findElement(By.name('username'));
    }

    getInputPassword() {
        return this.driver().findElement(By.name('password'));
    }

    getLoginButton() {
        return this.driver().findElement(By.name('login'));
    }

    fillInputUsername(username) {
        this.getInputUsername().sendKeys(username);
    }

    fillInputPassword(password) {
        this.getInputPassword().sendKeys(password);
    }

    async clickLoginButton() {
        await this.getLoginButton().click();
    }
}