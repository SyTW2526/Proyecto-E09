import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { describe, it, beforeEach, afterEach } from 'vitest';

describe('primera_pagina', () => {
  let driver;

  beforeEach(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  it('primera_pagina', async () => {
    await driver.get('http://localhost:5173/');
    await driver.manage().window().setRect({ width: 1838, height: 1048 });

    // Wait for page to fully load
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Sign In')]")),
      5000
    );

    // Verify main elements are present
    const signInBtn = await driver.findElement(
      By.xpath("//button[contains(text(),'Sign In')]")
    );
    expect(await signInBtn.isDisplayed()).toBe(true);

    const signUpBtn = await driver.findElement(
      By.xpath("//button[contains(text(),'Sign Up')]")
    );
    expect(await signUpBtn.isDisplayed()).toBe(true);

    const startBtn = await driver.findElement(
      By.xpath("//button[contains(text(),'Start Now')]")
    );
    expect(await startBtn.isDisplayed()).toBe(true);

    // Verify language selector exists
    const langBtn = await driver.findElement(
      By.xpath("//button[contains(@aria-label,'Language')]")
    );
    expect(await langBtn.isDisplayed()).toBe(true);

    // Verify main content is visible
    const body = await driver.findElement(By.tagName('body'));
    const bodyText = await body.getText();
    expect(bodyText).toContain('Collect');
    expect(bodyText).toContain('Trade');
    expect(bodyText).toContain('Explore');
  });
});
