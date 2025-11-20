import { WebDriver } from 'selenium-webdriver';

export interface TestConfig {
  baseUrl: string;
  implicitWaitMs: number;
  pageLoadTimeoutMs: number;
  browserName: 'chrome' | 'firefox' | 'safari';
}

export const defaultConfig: TestConfig = {
  baseUrl: 'http://localhost:5173',
  implicitWaitMs: 5000,
  pageLoadTimeoutMs: 15000,
  browserName: 'chrome',
};

export async function waitForElement(driver: WebDriver, selector: string, timeoutMs: number = 5000): Promise<any> {
  const element = await driver.wait(
    async () => {
      const elements = await driver.findElements({ css: selector });
      return elements.length > 0 ? elements[0] : null;
    },
    timeoutMs
  );
  return element;
}

export async function waitForUrl(driver: WebDriver, urlPattern: string | RegExp, timeoutMs: number = 5000): Promise<boolean> {
  const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;
  return await driver.wait(
    async () => {
      const currentUrl = await driver.getCurrentUrl();
      return pattern.test(currentUrl);
    },
    timeoutMs
  ).catch(() => false);
}

export async function clickElement(driver: WebDriver, selector: string): Promise<void> {
  const element = await waitForElement(driver, selector);
  if (element) {
    await element.click();
  } else {
    throw new Error(`Elemento no encontrado: ${selector}`);
  }
}

export async function fillInput(driver: WebDriver, selector: string, text: string): Promise<void> {
  const element = await waitForElement(driver, selector);
  if (element) {
    await element.clear();
    await element.sendKeys(text);
  } else {
    throw new Error(`Campo de entrada no encontrado: ${selector}`);
  }
}

export async function getText(driver: WebDriver, selector: string): Promise<string> {
  const element = await waitForElement(driver, selector);
  if (element) {
    return await element.getText();
  }
  return '';
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
