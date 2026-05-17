import React, { useState, useRef, useEffect } from 'react';
import { Download, FileCode, Layout, Settings, Sparkles, Wand2 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const DEFAULT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            stellar: '#6366f1',
          }
        }
      }
    }
  </script>
  <style>
    .page-break { page-break-before: always; }
    section, .glass-card, .rounded-xl { break-inside: avoid; }
  </style>
</head>

<body class="p-10 font-['Outfit'] bg-white">
  <div class="max-w-2xl mx-auto border-2 border-stellar/20 rounded-3xl p-8 shadow-2xl shadow-stellar/10">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-4xl font-extrabold text-stellar tracking-tight">Tailwind Support</h1>
      <span class="bg-stellar/10 text-stellar px-4 py-1 rounded-full text-sm font-semibold">v3.4+</span>
    </div>
    
    <p class="text-slate-600 text-lg mb-6 leading-relaxed">
      Esta vista previa ahora soporta <strong class="text-slate-900">Tailwind CDN</strong> y ejecución de scripts. 
      Cualquier clase de Tailwind que uses se procesará correctamente antes de la exportación.
    </p>

    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-stellar/30 transition-colors">
        <div class="text-2xl mb-2">🚀</div>
        <h3 class="font-bold text-slate-800">Rápido</h3>
        <p class="text-sm text-slate-500">Renderizado instantáneo con el motor de Tailwind.</p>
      </div>
      <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-stellar/30 transition-colors">
        <div class="text-2xl mb-2">💎</div>
        <h3 class="font-bold text-slate-800">Fiel</h3>
        <p class="text-sm text-slate-500">Mantiene gradientes, sombras y radios de borde.</p>
      </div>
    </div>

    <div class="bg-gradient-to-r from-stellar to-indigo-600 p-1 rounded-2xl">
      <div class="bg-white p-4 rounded-[calc(1rem-1px)]">
        <code class="text-sm text-indigo-600">class="bg-gradient-to-r from-stellar..."</code>
      </div>
    </div>
  </div>
</body>
</html>
`;


function App() {
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [isExporting, setIsExporting] = useState(false);
  const [isPdfPreview, setIsPdfPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Efecto principal para cargar y actualizar el iframe
  useEffect(() => {
    const updateIframe = () => {
      if (!iframeRef.current) return;
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write(htmlContent);
      doc.close();

      // Aplicar el modo PDF si está activo después de escribir el contenido
      if (isPdfPreview) {
        doc.body.classList.add('pdf-mode');
      }
    };

    updateIframe();
  }, [htmlContent, isPdfPreview]);

  const handleExport = async () => {
    if (!iframeRef.current) return;
    setIsExporting(true);
    
    try {
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;
      
      // Forzar clase pdf-mode para la exportación
      const wasPreview = isPdfPreview;
      doc.body.classList.add('pdf-mode');

      // Construir documento HTML completo para Puppeteer
      let htmlContent = '<!DOCTYPE html>\n<html>' + doc.documentElement.innerHTML + '</html>';

      if (!wasPreview) doc.body.classList.remove('pdf-mode');

      // TRUCO PARA IMÁGENES: Convertir rutas relativas a rutas absolutas
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => {
        if (img.src.startsWith(window.location.origin) || !img.src.startsWith('http')) {
          const fileName = img.getAttribute('src');
          img.src = `${window.location.origin}/${fileName}`;
        }
      });

      // Agregar regla @page al head del HTML exportado (size ya definido en el HTML)
      const style = document.createElement('style');
      style.textContent = `@page { size: A4; margin: 0; }`;
      tempDiv.querySelector('head')?.appendChild(style);

      let finalHtml = tempDiv.innerHTML;

      const response = await fetch('http://localhost:3001/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: finalHtml }),
      });

      if (!response.ok) throw new Error('Error en el servidor de PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bitacora-premium-agritech.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export Error:', error);
      alert('Error al generar el PDF. ¿Está el servidor encendido?');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles className="text-white" size={28} />
          </div>
          <div className="brand-text">
            <h1 className="title">StellarPDF</h1>
            <p className="subtitle">Conversión HTML a PDF de alta fidelidad</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button
            onClick={() => setIsPdfPreview(!isPdfPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isPdfPreview 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isPdfPreview ? (
              <><Layout className="w-4 h-4" /> Vista Web</>
            ) : (
              <><FileCode className="w-4 h-4" /> Vista PDF</>
            )}
          </button>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary"
          >

            {isExporting ? (
              <>
                <div className="spinner" />
                Exportando...
              </>
            ) : (
              <>
                <Download size={18} />
                Exportar PDF
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-layout">
        {/* Editor Side */}
        <section className="glass-card editor-section">
          <div className="section-header">
            <div className="section-title">
              <FileCode size={20} />
              <span>Editor HTML</span>
            </div>
            <button 
              onClick={() => setHtmlContent(DEFAULT_HTML)}
              className="btn-reset"
            >
              Restablecer
            </button>
          </div>
          
          <textarea
            className="input-field"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Pega tu HTML aquí..."
          />
          
          <div className="status-hint">
            <Wand2 size={14} />
            <span>Los cambios se reflejan instantáneamente</span>
          </div>
        </section>

        {/* Preview Side */}
        <section className="preview-section">
          <div className="section-title preview-title">
            <Layout size={20} />
            <span>Vista Previa (A4)</span>
          </div>
          
          <div className="glass-card preview-container">
            <div className="preview-scroll-area">
              <iframe
                ref={iframeRef}
                title="Preview"
                className="pdf-iframe"
                style={{ 
                  width: '210mm', 
                  minHeight: '297mm',
                  background: 'white',
                  border: 'none',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="app-footer">
        <div className="footer-status">
          <span className="status-badge">
            <div className="status-dot" />
            Motor Activo: Puppeteer (Chrome Headless) + Backend Node.js
          </span>
          <span className="separator">|</span>
          <span>Soporte: Scripts / Tailwind CDN</span>
        </div>
        <div className="footer-credits">
          StellarPDF Professional
        </div>
      </footer>
    </div>


  );
}

export default App;
