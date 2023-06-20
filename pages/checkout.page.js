"use strict";

const BasePage = require("./base.page");
const { By } = require("selenium-webdriver");

module.exports = class CheckoutPage extends BasePage {
    getPriceInformation() {
        return this.driver().findElement(By.tagName('h3'));
    }

    async getCheckoutOrderNumber() {
        return (await this.getPageTitle()).replace(/\D/g, '');
    }
}