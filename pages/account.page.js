"use strict";

const BasePage = require("./base.page");
const { By } = require("selenium-webdriver");

module.exports = class AccountPage extends BasePage {

    goToPage() {
        this.driver().get('http://shop.qa.rs/account');
    }

    getInputAddress1() {
        return this.driver().findElement(By.name('address1'));
    }

    getInputCity() {
        return this.driver().findElement(By.name('city'));
    }

    getInputZipCode() {
        return this.driver().findElement(By.name('zip_code'));
    }

    getInputCountry() {
        return this.driver().findElement(By.name('country'));
    }

    getButtonSave() {
        return this.driver().findElement(By.name('account'));
    }

    async fillInputAddress1(address) {
        await this.getInputAddress1().clear();
        this.getInputAddress1().sendKeys(address);
    }

    async fillInputCity(city) {
        await this.getInputCity().clear();
        this.getInputCity().sendKeys(city);
    }

    async fillInputZipCode(zipCode) {
        await this.getInputZipCode().clear();
        this.getInputZipCode().sendKeys(zipCode);
    }

    async fillInputCountry(country) {
        await this.getInputCountry().clear();
        this.getInputCountry().sendKeys(country);
    }

    async clickOnButtonSave() {
        await this.getButtonSave().click();
    }
}