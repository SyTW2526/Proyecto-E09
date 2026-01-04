import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { describe, it, beforeEach, afterEach } from "vitest";

describe("debug_language", () => {
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

  it("debug_language_menu", async () => {
    await driver.get("http://localhost:5173/");
    await driver.manage().window().setRect({ width: 1838, height: 1048 });

    // Wait and click language selector
    await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(@aria-label,'Language')]")
      ),
      5000
    );
    const langBtn = await driver.findElement(
      By.xpath("//button[contains(@aria-label,'Language')]")
    );
    await langBtn.click();
    
    console.log("\n=== AFTER CLICKING LANGUAGE BUTTON ===");
    
    // Wait a bit for menu to appear
    await driver.sleep(1000);
    
    // Try to find any dropdown or menu
    const allButtons = await driver.findElements(By.xpath("//button"));
    console.log(`Total buttons: ${allButtons.length}`);
    
    const allDivs = await driver.findElements(By.xpath("//div"));
    console.log(`Total divs: ${allDivs.length}`);
    
    // Try to find any element with Español or Spanish
    try {
      const elements = await driver.findElements(By.xpath("//*[contains(text(),'Español') or contains(text(),'Spanish')]"));
      console.log(`Found Español/Spanish elements: ${elements.length}`);
      if (elements.length > 0) {
        const text = await elements[0].getText();
        const tag = await elements[0].getTagName();
        console.log(`First element tag: ${tag}, text: ${text}`);
      }
    } catch (e) {
      console.log(`No Español/Spanish found: ${e.message}`);
    }
    
    // Get page source after click
    const html = await driver.getPageSource();
    const lines = html.split('\n');
    
    // Find language-related content
    console.log("\n=== SEARCHING FOR LANGUAGE CONTENT ===");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('español') || 
          lines[i].toLowerCase().includes('english') ||
          lines[i].includes('lang')) {
        console.log(`Line ${i}: ${lines[i].substring(0, 200)}`);
      }
    }
    
    // Log body text
    console.log("\n=== BODY TEXT ===");
    const body = await driver.findElement(By.tagName("body"));
    const text = await body.getText();
    console.log(text.substring(0, 500));
  });
});
