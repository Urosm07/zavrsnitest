"use strict";

require('chromedriver');
const webdriver = require('selenium-webdriver');
const { By, Key, until} = require('selenium-webdriver');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert, expect } = require('chai');
chai.should();

describe.only('AutomationExercise tests', function() {
    let driver;

    before(function () {
        driver = new webdriver.Builder().forBrowser('chrome').build();
    });

    after(async function () {
        await driver.quit();
    });

    it('Tests signup', async () => {
        await driver.get('https://automationexercise.com/login')

        const signupFormDiv = await driver.findElement(By.className('signup-form'));
        expect(await signupFormDiv.isDisplayed()).to.be.true;

        const inputName = await signupFormDiv.findElement(By.name('name'));
        const inputEmail = await driver.findElement(By.xpath('//input[@data-qa="signup-email"]'));
        const buttonSignup = await driver.findElement(By.xpath('//button[@data-qa="signup-button"]'));

        await inputName.sendKeys('Testy McTesterson');
        await inputEmail.sendKeys('testy@testy.local');
        await buttonSignup.click();

        const xpathTitle = '//h2[contains(@class, "title")]';

        await driver.wait(until.elementLocated(By.xpath(xpathTitle)));
        const signupPageTitle = driver.findElement(By.xpath(xpathTitle));
        expect(await signupPageTitle.getText()).to.contain('ACCOUNT');
    });
});