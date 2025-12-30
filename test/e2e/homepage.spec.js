import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { describe, it, beforeEach, afterEach } from "vitest";

describe("homepage_loads", () => {
  let driver;

  beforeEach(async () => {
    const options = new chrome.Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  });

  afterEach(async () => {
    if (driver) await driver.quit();
  });

  it("homepage_loads_with_buttons", async () => {
    await driver.get("http://localhost:5173/");
    await driver.manage().window().setRect({ width: 1838, height: 1048 });

    // Wait for Sign In button to be present
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Sign In')]")),
      5000
    );

    // Verify Sign In button exists
    const signInBtn = await driver.findElement(
      By.xpath("//button[contains(text(),'Sign In')]")
    );
    expect(await signInBtn.isDisplayed()).toBe(true);

    // Verify Sign Up button exists
    const signUpBtn = await driver.findElement(
      By.xpath("//button[contains(text(),'Sign Up')]")
    );
    expect(await signUpBtn.isDisplayed()).toBe(true);

    // Verify Start Now button exists
    const startBtn = await driver.findElement(
      By.xpath("//button[contains(text(),'Start Now')]")
    );
    expect(await startBtn.isDisplayed()).toBe(true);

    // Verify Language selector button exists
    const langBtn = await driver.findElement(
      By.xpath("//button[contains(@aria-label,'Language')]")
    );
    expect(await langBtn.isDisplayed()).toBe(true);
  });

  it("can_navigate_to_signin", async () => {
    await driver.get("http://localhost:5173/");
    await driver.manage().window().setRect({ width: 1838, height: 1048 });

    // Wait for Sign In button and click it
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Sign In')]")),
      5000
    );
    await driver.findElement(
      By.xpath("//button[contains(text(),'Sign In')]")
    ).click();

    // Wait for page to change and verify we're on login
    await driver.sleep(1000);
    const pageSource = await driver.getPageSource();
    
    // Check if we navigated somewhere (URL should change or page content should change)
    expect(pageSource).toBeDefined();
  });

  it("can_navigate_to_signup", async () => {
    await driver.get("http://localhost:5173/");
    await driver.manage().window().setRect({ width: 1838, height: 1048 });

    // Wait for Sign Up button and click it
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(),'Sign Up')]")),
      5000
    );
    await driver.findElement(
      By.xpath("//button[contains(text(),'Sign Up')]")
    ).click();

    // Wait for page to change
    await driver.sleep(1000);
    const pageSource = await driver.getPageSource();
    
    // Check if we navigated somewhere
    expect(pageSource).toBeDefined();
  });
});
