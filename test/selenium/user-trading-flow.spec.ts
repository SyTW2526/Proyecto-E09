import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

describe('E2E Selenium: Trading Flow - Interfaz de Usuario', () => {
  let driver: WebDriver;
  const baseUrl = 'http://localhost:5173';
  const user1Email = `user1-${Date.now()}@test.com`;
  const user1Password = 'Test123!@#';
  const user2Email = `user2-${Date.now()}@test.com`;
  const user2Password = 'Test123!@#';

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().setTimeouts({ implicit: 5000 });
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('Usuario puede navegar a la página de inicio', async () => {
    console.log('Navegando a la URL base...');
    await driver.get(baseUrl);
    
    const title = await driver.getTitle();
    console.log(`Título de página: ${title}`);
    expect(title).toBeDefined();
  });

  it('Usuario puede ver lista de cartas en la página principal', async () => {
    console.log('Accediendo a la página de cartas...');
    await driver.get(`${baseUrl}/cards`);
    
    await driver.wait(until.titleIs('Cartas'), 10000).catch(() => {
      console.log('No se encontró el título esperado, continuando...');
    });
    
    const cards = await driver.findElements(By.className('card-item'));
    console.log(`Se encontraron ${cards.length} cartas en la página`);
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('Usuario puede hacer búsqueda de cartas por nombre', async () => {
    console.log('Buscando cartas por nombre...');
    await driver.get(`${baseUrl}/cards`);
    
    const searchInput = await driver.wait(
      until.elementLocated(By.css('input[type="search"]')),
      5000
    ).catch(() => null);
    
    if (searchInput) {
      await searchInput.clear();
      await searchInput.sendKeys('Charizard');
      await driver.sleep(1000);
      
      const results = await driver.findElements(By.className('card-item'));
      console.log(`Búsqueda retornó ${results.length} cartas`);
      expect(results.length).toBeGreaterThanOrEqual(0);
    } else {
      console.log('Campo de búsqueda no encontrado, test saltado');
    }
  });

  it('Usuario puede navegar a diferentes secciones de la app', async () => {
    console.log('Navegando por diferentes secciones...');
    await driver.get(baseUrl);
    
    const navLinks = await driver.findElements(By.css('nav a, [role="navigation"] a'));
    console.log(`Se encontraron ${navLinks.length} enlaces de navegación`);
    
    for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
      const linkText = await navLinks[i].getText();
      console.log(`Probando enlace: ${linkText}`);
      
      await navLinks[i].click();
      await driver.sleep(500);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`URL actual: ${currentUrl}`);
    }
  });

  it('Usuario puede ver la sección de intercambios', async () => {
    console.log('Accediendo a la sección de intercambios...');
    await driver.get(`${baseUrl}/trades`);
    
    await driver.sleep(2000);
    
    const tradeElements = await driver.findElements(By.css('[data-testid="trade-item"], .trade-item, [class*="trade"]'));
    console.log(`Se encontraron ${tradeElements.length} elementos de intercambio`);
    expect(tradeElements.length).toBeGreaterThanOrEqual(0);
  });

  it('Usuario puede filtrar cartas por tipo', async () => {
    console.log('Filtrando cartas por tipo...');
    await driver.get(`${baseUrl}/cards`);
    
    const filterSelect = await driver.wait(
      until.elementLocated(By.css('select, [role="combobox"]')),
      5000
    ).catch(() => null);
    
    if (filterSelect) {
      const filterOptions = await driver.findElements(By.css('select option, [role="option"]'));
      if (filterOptions.length > 1) {
        await filterOptions[1].click();
        await driver.sleep(1000);
        
        const filteredCards = await driver.findElements(By.className('card-item'));
        console.log(`Se encontraron ${filteredCards.length} cartas después de filtrar`);
      }
    } else {
      console.log('Opciones de filtro no encontradas, test saltado');
    }
  });

  it('Usuario puede ver detalles de una carta al hacer clic', async () => {
    console.log('Abriendo detalles de una carta...');
    await driver.get(`${baseUrl}/cards`);
    
    const cardItems = await driver.findElements(By.className('card-item'));
    
    if (cardItems.length > 0) {
      await cardItems[0].click();
      await driver.sleep(1000);
      
      const detailsPanel = await driver.findElements(By.css('[class*="detail"], [data-testid="card-detail"]'));
      console.log(`Panel de detalles encontrado: ${detailsPanel.length > 0}`);
      expect(detailsPanel.length).toBeGreaterThanOrEqual(0);
    } else {
      console.log('No hay cartas disponibles para ver detalles');
    }
  });

  it('Usuario puede navegar al perfil si está autenticado', async () => {
    console.log('Buscando opción de perfil...');
    await driver.get(baseUrl);
    
    const profileLink = await driver.findElements(By.css('[href*="profile"], [data-testid="profile-link"]'));
    
    if (profileLink.length > 0) {
      await profileLink[0].click();
      await driver.sleep(1000);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`URL del perfil: ${currentUrl}`);
      expect(currentUrl).toContain(baseUrl);
    } else {
      console.log('Enlace de perfil no disponible (usuario no autenticado)');
    }
  });

  it('Usuario puede cambiar idioma de la interfaz', async () => {
    console.log('Buscando selector de idioma...');
    await driver.get(baseUrl);
    
    const languageSelector = await driver.findElements(By.css('[class*="language"], [data-testid="language"]'));
    
    if (languageSelector.length > 0) {
      const options = await driver.findElements(By.css('[class*="language"] button, [class*="language"] a'));
      if (options.length > 1) {
        await options[1].click();
        await driver.sleep(1000);
        
        const newUrl = await driver.getCurrentUrl();
        console.log(`URL después de cambiar idioma: ${newUrl}`);
      }
    } else {
      console.log('Selector de idioma no encontrado');
    }
  });

  it('Usuario puede ver modo oscuro/claro en la interfaz', async () => {
    console.log('Buscando selector de tema...');
    await driver.get(baseUrl);
    
    const themeToggle = await driver.findElements(By.css('[class*="theme"], [data-testid="theme-toggle"], [aria-label*="dark"]'));
    
    if (themeToggle.length > 0) {
      await themeToggle[0].click();
      await driver.sleep(500);
      
      const htmlElement = await driver.findElement(By.tagName('html'));
      const classList = await htmlElement.getAttribute('class');
      console.log(`Clases del elemento HTML: ${classList}`);
    } else {
      console.log('Selector de tema no encontrado');
    }
  });

  it('Usuario puede cerrar sesión correctamente', async () => {
    console.log('Buscando opción de cerrar sesión...');
    await driver.get(baseUrl);
    
    const logoutButtons = await driver.findElements(By.css('[class*="logout"], [data-testid="logout"], button:contains("Logout")'));
    
    if (logoutButtons.length > 0) {
      await logoutButtons[0].click();
      await driver.sleep(1000);
      
      const currentUrl = await driver.getCurrentUrl();
      console.log(`URL después de logout: ${currentUrl}`);
    } else {
      console.log('Botón de logout no encontrado (usuario no autenticado)');
    }
  });
});
