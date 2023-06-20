"use strict";
require('selenium-webdriver/firefox');

const webdriver = require('selenium-webdriver');
const { assert, expect } = require('chai');
const { By, until } = require('selenium-webdriver');

const HomePage = require('../pages/home.page');
const RegisterPage = require('../pages/register.page');
const LoginPage = require('../pages/login.page');
const CartPage = require('../pages/cart.page')
const CheckoutPage = require('../pages/checkout.page')
const testData = require('../data/food.json');

describe('shop.QaFastFOod test', function () {
    let driver;
    let pageHomePage;
    let pageRegisterPage;
    let pageLoginPage;
    let pageCartPage;
    let pageCheckoutPage;
    let packages;

    before(async () => {
        driver = new webdriver.Builder().forBrowser('firefox').build();
        pageHomePage = new HomePage(driver);
        pageRegisterPage = new RegisterPage(driver);
        pageLoginPage = new LoginPage(driver);
        pageCartPage = new CartPage(driver);
        pageCheckoutPage = new CheckoutPage(driver);

        packages = testData.order;
    });

    after(async () => {
        await driver.quit()
    });

    it('Goes to registration page', async () => {
        await pageRegisterPage.goToPage();
        expect(await pageRegisterPage.getRegisterButtonValue()).to.contain('Register');
        expect(await pageRegisterPage.getCurrentUrl()).to.be.eq('http://shop.qa.rs/register');
    })

    it('Register username with appended random number performs registration', async () => {
        const randomNumber = pageRegisterPage.random(1, 1000);

        await pageRegisterPage.getInputFirstName().sendKeys(testData.account.firstname);
        await pageRegisterPage.getInputLastName().sendKeys(testData.account.lastname);
        await pageRegisterPage.getInputEmail().sendKeys(testData.account.email + randomNumber);

        await pageRegisterPage.fillInputUsername(testData.account.username + randomNumber);
        await pageRegisterPage.fillInputPassword(testData.account.password);
        await pageRegisterPage.fillInputPasswordConfirm(testData.account.password);

        await pageRegisterPage.getRegisterButton().click();

        await driver.sleep(3000);

        expect(await pageRegisterPage.getSuccessAlertText()).to.contain('Uspeh!');
    });

    it('Go to login page and login with registered user', async () => {
        await pageLoginPage.goToPage();
        await driver.sleep(3000)
        await pageLoginPage.fillInputUsername(testData.account.username);
        await pageLoginPage.fillInputPassword(testData.account.password);
        await pageLoginPage.clickLoginButton();

        await driver.sleep(4000)

        expect(await pageHomePage.getWelcomeBackTitle()).to.contain('Welcome back, ' + testData.account.firstname);
    });

    it ('Order items and add them to cart', async () => {
        for (const index in packages) {
            const item = packages[index];

            const packageDiv = await pageHomePage.getPackageDiv(item.package);

            await pageHomePage.getInputQuantity(packageDiv).clear();
            await pageHomePage.getInputQuantity(packageDiv).sendKeys(item.quantity);

            if (item.cutlery === true) {
                await pageHomePage.getInputCutlery(packageDiv).click();
            }

            const sideDishDropdownOption = await pageHomePage.getSideDishDropdown(packageDiv);
            const options = await pageHomePage.getSideDishOptions(sideDishDropdownOption);

            await Promise.all(options.map(async (option) => {
                const text = await option.getText();

                if (text === item.sideDish) {
                    await option.click();

                    await pageHomePage.getOrderButton(packageDiv).click();
                    expect(await driver.getCurrentUrl()).to.contain('http://test.qa.rs/order');
                }}
            ));
            pageHomePage.goToPage();
        }
    });

    it ('Opens shopping cart', async () => {
        await pageHomePage.clickOnViewShoppingCartLink();

        expect (await pageCartPage.getCurrentUrl()).to.be.eq('http://shop.qa.rs/');
        expect (await pageCartPage.getPageHeaderTitle()).to.contain('Order');
    });

    it ('Verifies items are in cart', async () => {
        for (const index in packages) {
            const item = packages[index];

            const orderRow = await pageCartPage.getOrderRow(item.package.toUpperCase());
            const itemQuantity = await pageCartPage.getItemQuantity(orderRow);

            expect (await itemQuantity.getText()).to.eq(item.quantity.toString());
        }
    });

    it ('Verifies total item price is correct', async () => {
        for (const index in packages) {
            const item = packages[index];

            const orderRow = await pageCartPage.getOrderRow(item.package.toUpperCase());
            const itemQuantity = await pageCartPage.getItemQuantity(orderRow);
            const itemPrice = await pageCartPage.getItemPrice(orderRow);

            const quantity = Number(await itemQuantity.getText());
            const price = ((await itemPrice.getText()).replaceAll('$', ''));

            let priceWithout$ = (price.toString());
            let finalPrice = eval(priceWithout$);

            const totalItemPrice = Number (finalPrice * quantity);
        }
        cartTotalAmount = Number ((await pageCartPage.getCartTotal().getText()).replace('Total: $', ''));
        expect(totalItemPrice.to.be.eq(cartTotalAmount));
    });

    it ('Performs checkout', async () => {
        await pageCartPage.clickOnCheckoutButton();

        expect (await pageCheckoutPage.getPageTitle()).to.contain('You have successfully placed your order.');
    });

    it ('Verifies checkout total amount', async () => {
        const informationRow = await pageCheckoutPage.getPriceInformation();
        const checkoutPrice = Number ((await informationRow.getText()).replace('Your credit card has been charged with the amount of $', ''));

        cartTotalAmount = Number ((await pageCartPage.getCartTotal().getText()).replace('Total: $', ''));
        expect(checkoutPrice).to.be.eq(cartTotalAmount);
    });

    it ('Successfully perform user logout', async () => {
        await pageHomePage.clickLogoutLink();

        expect (await pageHomePage.isLoginLinkDisplayed()).to.be.true;
    });
});