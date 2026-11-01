// Configuração pública do frontend: este arquivo é servido ao navegador.
// NUNCA coloque chaves, tokens ou segredos aqui.
//
// Local: aponta para a API exposta pelo Docker Compose em localhost:5000.
// Produção: o workflow .github/workflows/deploy-pages.yml substitui este
// arquivo por window.API_URL com a URL HTTPS da API no Render, obtida da
// variável de repositório PUBLIC_API_URL (ver docs/implantacao.md).
if (!window.API_URL) {
  window.API_URL = "http://localhost:5000";
}
