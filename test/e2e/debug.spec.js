import { Builder, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { describe, it, beforeEach, afterEach } from "vitest";

describe("debug_page", () => {
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

  it("debug_inspect_dom", async () => {
    await driver.get("http://localhost:5173/");
    await driver.manage().window().setRect({ width: 1838, height: 1048 });

    // Wait for page to load
    await driver.sleep(3000);

    // Get page source
    const pageSource = await driver.getPageSource();
    
    // Log buttons with aria-label
    console.log("\n=== BUTTONS WITH ARIA-LABEL ===");
    const buttons = await driver.findElements(By.xpath("//button"));
    for (const btn of buttons) {
      const ariaLabel = await btn.getAttribute("aria-label");
      const text = await btn.getText();
      if (ariaLabel || text) {
        console.log(`Button - aria-label: "${ariaLabel}", text: "${text}"`);
      }
    }

    // Log all text content
    console.log("\n=== ALL VISIBLE TEXT ===");
    const body = await driver.findElement(By.tagName("body"));
    const text = await body.getText();
    console.log(text);

    // Log page structure
    console.log("\n=== PAGE STRUCTURE ===");
    const html = await driver.getPageSource();
    const lines = html.split('\n').slice(0, 200);
    console.log(lines.join('\n'));
  });
});
