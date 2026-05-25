const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('[1/4] Abriendo login...');
    await page.goto('https://inventario.exegestion.com/login', { waitUntil: 'networkidle' });

    console.log('[2/4] Completando credenciales...');
    await page.locator('input[type="email"]').fill('exetest@gmail.com');
    await page.locator('input[type="password"]').fill('exe123123');
    await page.locator('button[type="submit"]').click();

    console.log('[3/4] Esperando redirección post-login...');
    await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 20000 });
    console.log('    Login OK. URL:', page.url());

    console.log('[4/4] Navegando a Productos...');
    await page.goto('https://inventario.exegestion.com/products', { waitUntil: 'networkidle' });
    console.log('    Productos OK. URL final:', page.url());

    console.log('Keep-alive completado correctamente.');
  } catch (err) {
    console.error('ERROR en keep-alive:', err.message);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
})();
