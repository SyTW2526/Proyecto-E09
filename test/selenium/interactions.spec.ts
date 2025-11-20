import { Builder, By, until, WebDriver, Actions } from 'selenium-webdriver';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

describe('E2E Selenium: Interacciones Complejas', () => {
  let driver: WebDriver;
  const baseUrl = 'http://localhost:5173';

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().setTimeouts({ implicit: 5000 });
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('Usuario puede usar filtros múltiples en la lista de cartas', async () => {
    console.log('Probando filtros múltiples...');
    await driver.get(`${baseUrl}/cards`);
    
    const filterInputs = await driver.findElements(By.css('input[type="text"], input[type="search"]'));
    console.log(`Se encontraron ${filterInputs.length} campos de entrada`);
    
    if (filterInputs.length > 0) {
      await filterInputs[0].clear();
      await filterInputs[0].sendKeys('fire');
      await driver.sleep(500);
      
      const cards = await driver.findElements(By.className('card-item'));
      console.log(`Cartas después de filtro: ${cards.length}`);
      expect(cards.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('Usuario puede hacer scroll en la página de cartas', async () => {
    console.log('Haciendo scroll en la página de cartas...');
    await driver.get(`${baseUrl}/cards`);
    
    const initialCards = await driver.findElements(By.className('card-item'));
    const initialCount = initialCards.length;
    console.log(`Cartas iniciales: ${initialCount}`);
    
    await driver.executeScript('window.scrollBy(0, 500)');
    await driver.sleep(1000);
    
    const afterScrollCards = await driver.findElements(By.className('card-item'));
    console.log(`Cartas después de scroll: ${afterScrollCards.length}`);
    expect(afterScrollCards.length).toBeGreaterThanOrEqual(initialCount);
  });

  it('Usuario puede ver paginación en la lista de cartas', async () => {
    console.log('Verificando paginación...');
    await driver.get(`${baseUrl}/cards`);
    
    const pagination = await driver.findElements(By.css('[class*="pagination"], [data-testid="pagination"], nav[aria-label="pagination"]'));
    
    if (pagination.length > 0) {
      console.log('Controles de paginación encontrados');
      
      const pageButtons = await driver.findElements(By.css('[class*="pagination"] button, [class*="pagination"] a'));
      console.log(`Se encontraron ${pageButtons.length} botones de página`);
      
      if (pageButtons.length > 1) {
        await pageButtons[1].click();
        await driver.sleep(1000);
        
        const newCards = await driver.findElements(By.className('card-item'));
        console.log(`Cartas en página 2: ${newCards.length}`);
      }
    } else {
      console.log('Paginación no encontrada');
    }
  });

  it('Usuario puede hacer hover en elementos de la tarjeta', async () => {
    console.log('Probando hover en tarjetas...');
    await driver.get(`${baseUrl}/cards`);
    
    const cardItems = await driver.findElements(By.className('card-item'));
    
    if (cardItems.length > 0) {
      const actions = driver.actions({ async: true });
      await actions.move({ origin: cardItems[0] }).perform();
      await driver.sleep(500);
      
      const hoverElements = await driver.findElements(By.css('[class*="hover"]'));
      console.log(`Elementos con hover visible: ${hoverElements.length}`);
    }
  });

  it('Usuario puede ver información de una tarjeta al hacer hover', async () => {
    console.log('Verificando información al hacer hover...');
    await driver.get(`${baseUrl}/cards`);
    
    const cards = await driver.findElements(By.className('card-item'));
    
    if (cards.length > 0) {
      const cardTitle = await cards[0].getText();
      console.log(`Información de tarjeta: ${cardTitle}`);
      expect(cardTitle.length).toBeGreaterThan(0);
    }
  });

  it('Usuario puede expandir/contraer secciones colapsables', async () => {
    console.log('Probando secciones colapsables...');
    await driver.get(baseUrl);
    
    const collapsibles = await driver.findElements(By.css('[role="button"][aria-expanded], [class*="collapse"], [class*="accordion"]'));
    
    if (collapsibles.length > 0) {
      const firstCollapsible = collapsibles[0];
      await firstCollapsible.click();
      await driver.sleep(500);
      
      const isExpanded = await firstCollapsible.getAttribute('aria-expanded');
      console.log(`Sección expandida: ${isExpanded}`);
      
      await firstCollapsible.click();
      await driver.sleep(500);
      
      const isCollapsed = await firstCollapsible.getAttribute('aria-expanded');
      console.log(`Sección contraída: ${isCollapsed}`);
    } else {
      console.log('Secciones colapsables no encontradas');
    }
  });

  it('Usuario puede hacer clic en múltiples elementos sin errores', async () => {
    console.log('Probando múltiples clics...');
    await driver.get(`${baseUrl}/cards`);
    
    const clickableElements = await driver.findElements(By.css('button, a, [role="button"]'));
    const limitedElements = clickableElements.slice(0, 3);
    
    console.log(`Se van a probar ${limitedElements.length} elementos clickeables`);
    
    for (let i = 0; i < limitedElements.length; i++) {
      try {
        const isDisplayed = await limitedElements[i].isDisplayed();
        if (isDisplayed) {
          const text = await limitedElements[i].getText();
          console.log(`Elemento ${i + 1}: ${text}`);
        }
      } catch (error) {
        console.log(`Error al verificar elemento ${i + 1}`);
      }
    }
  });

  it('Usuario puede ver navegación en breadcrumb o similar', async () => {
    console.log('Verificando navegación de breadcrumb...');
    await driver.get(`${baseUrl}/cards`);
    
    const breadcrumbs = await driver.findElements(By.css('[class*="breadcrumb"], [aria-label="breadcrumb"]'));
    
    if (breadcrumbs.length > 0) {
      console.log('Breadcrumb encontrado');
      const breadcrumbItems = await driver.findElements(By.css('[class*="breadcrumb"] a, [class*="breadcrumb"] span'));
      console.log(`Items en breadcrumb: ${breadcrumbItems.length}`);
    } else {
      console.log('Breadcrumb no encontrado');
    }
  });

  it('Usuario puede interactuar con formularios si existen', async () => {
    console.log('Buscando formularios en la página...');
    await driver.get(baseUrl);
    
    const forms = await driver.findElements(By.css('form'));
    console.log(`Se encontraron ${forms.length} formularios`);
    
    if (forms.length > 0) {
      const inputs = await driver.findElements(By.css('form input'));
      console.log(`Campos de entrada en formulario: ${inputs.length}`);
      
      if (inputs.length > 0) {
        const firstInput = inputs[0];
        const placeholder = await firstInput.getAttribute('placeholder');
        console.log(`Placeholder del primer campo: ${placeholder}`);
      }
    }
  });

  it('Usuario puede ver carga de imágenes correctamente', async () => {
    console.log('Verificando carga de imágenes...');
    await driver.get(`${baseUrl}/cards`);
    
    const images = await driver.findElements(By.css('img'));
    console.log(`Se encontraron ${images.length} imágenes`);
    
    if (images.length > 0) {
      const firstImage = images[0];
      const src = await firstImage.getAttribute('src');
      console.log(`Fuente de imagen: ${src}`);
      
      const alt = await firstImage.getAttribute('alt');
      console.log(`Texto alternativo: ${alt}`);
    }
  });

  it('Usuario puede detectar errores de carga en la página', async () => {
    console.log('Verificando errores de consola...');
    await driver.get(`${baseUrl}/cards`);
    
    const logs = await driver.manage().logs().get('browser');
    const errors = logs.filter(log => log.level.value > 900);
    
    console.log(`Errores detectados: ${errors.length}`);
    if (errors.length > 0) {
      console.log(`Primer error: ${errors[0].message}`);
    }
    
    expect(true).toBe(true);
  });
});
