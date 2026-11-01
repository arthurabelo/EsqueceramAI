// Produção (GitHub Pages): URL pública do backend no Render.
// Ajuste este valor após criar o serviço no Render
// (ex.: "https://esqueceram-ai-api.onrender.com").
const PRODUCTION_API_URL = "https://seu-servico.onrender.com";

// Em GitHub Pages usa a API do Render; em desenvolvimento local usa a porta 5000
// (o Docker Compose expõe a API em http://localhost:5000).
const API_URL =
  window.API_URL ||
  (window.location.hostname.endsWith(".github.io")
    ? PRODUCTION_API_URL
    : "http://localhost:5000");
