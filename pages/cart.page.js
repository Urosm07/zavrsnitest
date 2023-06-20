"use strict";

const BasePage = require("./base.page");
const { By } = require("selenium-webdriver");

module.exports = class CartPage extends BasePage {

    getOrderRow(packageName) {
        const xpathOrderRow = `//td[contains(., "${packageName}")]/parent::tr`;
        return this.driver().findElement(By.xpath(xpathOrderRow));
    }

    getItemQuantity(orderRow) {
        return orderRow.findElement(By.xpath('td[2]'));
    }

    getItemPrice(orderRow) {
        return orderRow.findElement(By.xpath('td[3]'));
    }

    getItemPriceTotal(orderRow) {
        return orderRow.findElement(By.xpath('td[4]'));
    }

    actionEmptyCart() {
        this.driver().get('http://test.qa.rs/cart/empty');
    }

    getCheckoutButton() {
        return this.driver().findElement(By.name('checkout'));
    }

    async clickOnCheckoutButton() {
        await (await this.getCheckoutButton()).click();
    }

    getCartTotal() {
        const xpathTotalRow = `//td[contains(., "Total:")]`;
        return this.driver().findElement(By.xpath(xpathTotalRow));
    }
}