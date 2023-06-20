"use strict";

const BasePage = require("./base.page");
const { By } = require("selenium-webdriver");

module.exports = class HistoryPage extends BasePage {
    goToPage() {
        this.driver().get('http://shop.qa.rs/history');
    }

    getOrderRow(orderNumber) {
        const xpathOrderRow = `//td[contains(., "#${orderNumber}")]/parent::tr`;
        return this.driver().findElement(By.xpath(xpathOrderRow));
    }

    getOrderTotal(orderNumber) {
        return this.getOrderRow(orderNumber).findElement(By.className('total'));
    }
}