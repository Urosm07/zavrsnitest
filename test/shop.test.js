"use strict";

require('chromedriver');
const webdriver = require('selenium-webdriver');
const { By, Key, until} = require('selenium-webdriver');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { assert, expect } = require('chai');
chai.should();
require('dotenv').config()

const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');
const LoginPage = require('../pages/login.page');
const CartPage = require("../pages/cart.page");
const CheckoutPage = require('../pages/checkout.page');
const AccountPage = require('../pages/account.page');
const HistoryPage = require('../pages/history.page');

const testData = require('../data/shop.json');

describe('shop.QA.rs tests', function() {
    let driver;
    let pageHomepage;
    let pageRegister;
    let pageLogin;
    let pageCart;
    let pageCheckout;
    let pageAccount;
    let pageHistory;

    let cartTotalAmount;

    let packages;

    before(function() {
        driver = new webdriver.Builder().forBrowser(process.env.USE_BROWSER).build();
        pageHomepage = new HomePage(driver);
        pageRegister = new RegisterPage(driver);
        pageLogin = new LoginPage(driver);
        pageCart = new CartPage(driver);
        pageCheckout = new CheckoutPage(driver);
        pageAccount = new AccountPage(driver)
        pageHistory = new HistoryPage(driver);

        packages = testData.order;
    });

    after(async function() {
        await driver.quit();
    });

    beforeEach(function() {
        // Pokreće se pre svakog testa
    });

    afterEach(function() {
        // Pokreće se nakon svakog testa
    });

    it('Verifies homepage is open', async function(){
        await pageHomepage.goToPage();
        const pageTitle = await pageHomepage.getPageHeaderTitle();
        expect(pageTitle).to.contain('(QA) Shop');
        expect(await pageHomepage.isBugListDivDisplayed()).to.be.true;
    });

    it('Goes to registration page', async function() {
        await pageHomepage.clickOnRegisterLink();
        /*
        await pageRegister.goToPage();
        */
        expect(await pageRegister.getRegisterButtonValue()).to.contain('Register');
        expect(await pageRegister.getCurrentUrl()).to.be.eq('http://shop.qa.rs/register');
    })

    it('Successfully performs registration', async function() {
        await pageRegister.getInputFirstName().sendKeys(testData.account.firstname);
        await pageRegister.getInputLastName().sendKeys(testData.account.lastname);
        await pageRegister.getInputEmail().sendKeys(testData.account.email);

        const randomNumber = pageRegister.random(10000, 100000000);

        await pageRegister.fillInputUsername(process.env.LOGIN_USERNAME + '.' + randomNumber);
        await pageRegister.fillInputPassword(process.env.LOGIN_PASSWORD);
        await pageRegister.fillInputPasswordConfirm(process.env.LOGIN_PASSWORD);

        await pageRegister.getRegisterButton().click();

        expect(await pageHomepage.getSuccessAlertText()).to.contain('Uspeh!');
    });

    it('Goes to login page and performs login', async function() {
        await pageLogin.goToPage();

        await pageLogin.fillInputUsername(process.env.LOGIN_USERNAME);
        await pageLogin.fillInputPassword(process.env.LOGIN_PASSWORD);
        await pageLogin.clickLoginButton();

        expect(await pageHomepage.getWelcomeBackTitle()).to.contain('Welcome back');
        assert.isTrue(await pageHomepage.isLogoutLinkDisplayed());
    });

    it('Goes to account page and fills in information', async function() {
        await pageAccount.goToPage();

        pageAccount.getPageTitle().should.eventually.be.eq('My Account');

        await pageAccount.fillInputAddress1(testData.account.address1);
        await pageAccount.fillInputCity(testData.account.city);
        await pageAccount.fillInputZipCode(testData.account.zipCode);
        await pageAccount.fillInputCountry(testData.account.country);
        await pageAccount.clickOnButtonSave();

        await pageAccount.goToPage();
        pageAccount.getInputAddress1().getAttribute('value').should.eventually.be.eq(testData.account.address1);
        expect(await pageAccount.getInputCity().getAttribute('value')).to.eq(testData.account.city);
        expect(await pageAccount.getInputZipCode().getAttribute('value')).to.eq(testData.account.zipCode);
        expect(await pageAccount.getInputCountry().getAttribute('value')).to.eq(testData.account.country);
    });

    it('Empties the shopping cart', async function() {
        await pageCart.actionEmptyCart();
    });

    it('Adds item(s) to cart', async function() {
        for (const index in packages) {
            const item = packages[index];
            const packageDiv = await pageHomepage.getPackageDiv(item.package);
            const quantity = await pageHomepage.getQuantityDropdown(packageDiv);
            const options = await pageHomepage.getQuantityOptions(quantity);

            await Promise.all(options.map(async function(option) {
                const text = await option.getText();

                if (text === item.quantity.toString()) {
                    await option.click();

                    const selectedValue = await quantity.getAttribute('value');
                    expect(selectedValue).to.contain(item.quantity.toString());

                    await pageHomepage.getOrderButton(packageDiv).click();
                    expect(await driver.getCurrentUrl()).to.contain('http://shop.qa.rs/order');
                }
            }));

            pageHomepage.goToPage();
        }
    });

    it('Opens shopping cart', async function(){
        await pageHomepage.clickOnViewShoppingCartLink();

        expect(await pageCart.getCurrentUrl()).to.be.eq('http://shop.qa.rs/cart');
        expect(await pageCart.getPageHeaderTitle()).to.contain('Order');
    });

    it('Verifies items are in cart', async () => {
        for (const index in packages) {
            const item = packages[index];

            const orderRow = await pageCart.getOrderRow(item.package.toUpperCase());
            const itemQuantity = await pageCart.getItemQuantity(orderRow);

            expect(await itemQuantity.getText()).to.eq(item.quantity.toString());
        }
    });

    it('Verifies total item price is correct', async function() {
        for (const index in packages) {
            const item = packages[index];

            const orderRow = await pageCart.getOrderRow(item.package.toUpperCase());
            const itemQuantity = await pageCart.getItemQuantity(orderRow);
            const itemPrice = await pageCart.getItemPrice(orderRow);
            const itemPriceTotal = await pageCart.getItemPriceTotal(orderRow);

            const quantity = Number(await itemQuantity.getText())

            const price = Number((await itemPrice.getText()).substring(1))
            const total = Number((await itemPriceTotal.getText()).substring(1));

            const price2 = Number((await itemPrice.getText()).replace('$', ''));
            const total2 = Number((await itemPriceTotal.getText()).replace('$', ''));

            const price3 = Number((await itemPrice.getText()).replace(/\D/g, ''));
            const total3 = Number((await itemPriceTotal.getText()).replace(/\D/g, ''));

            const calculatedItemPriceTotal = quantity * price;
            const calculatedItemPriceTotal2 = quantity * price2;
            const calculatedItemPriceTotal3 = quantity * price3;

            expect(calculatedItemPriceTotal).to.be.eq(total);
            expect(calculatedItemPriceTotal2).to.be.eq(total2);
            expect(calculatedItemPriceTotal3).to.be.eq(total3);
        }

        cartTotalAmount = Number((await pageCart.getCartTotal().getText()).replace(/\D/g, ''));
    });

    it('Performs checkout', async function() {
        await pageCart.clickOnCheckoutButton();

        expect(await pageCheckout.getPageTitle()).to.contain('You have successfully placed your order.');
    });

    it('Verifies checkout total amount', async () => {
        const informationRow = await pageCheckout.getPriceInformation();
        const checkoutPrice = Number((await informationRow.getText()).replace(/\D/g, ''));

        expect(checkoutPrice).to.be.eq(cartTotalAmount);
    });

    it('Verifies order is in order history listing', async () => {
        const orderNumber = await pageCheckout.getCheckoutOrderNumber();

        await pageHistory.goToPage();

        expect(await pageHistory.getPageHeaderTitle()).to.contain('Order History');

        const historyTotal = Number(await pageHistory.getOrderTotal(orderNumber).getText());

        expect(historyTotal).to.be.eq(cartTotalAmount);
    });

    it('Performs logout', async function() {
        await pageHomepage.clickLogoutLink();

        expect(await pageHomepage.isLoginLinkDisplayed()).to.be.true;
    });

});