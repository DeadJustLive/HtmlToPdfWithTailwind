const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).send('HTML content is required');
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Viewport de escritorio: asegura que Tailwind md:/lg: se activen
    await page.setViewport({ width: 1200, height: 900 });

    // Establecer el contenido y esperar a que las fuentes y redes estén inactivas
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
      timeout: 30000
    });

    // Añadir un pequeño retraso extra para asegurar que Tailwind CDN termine de procesar
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }

    });

    await browser.close();

    res.contentType("application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`PDF Generation server running at http://localhost:${PORT}`);
});
