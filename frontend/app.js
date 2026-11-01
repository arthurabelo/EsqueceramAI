// window.API_URL vem de config.js (gerado no deploy do GitHub Pages).
// Remove barras finais para concatenar os caminhos da API sem "//".
const API_URL = (window.API_URL || "http://localhost:5000").replace(/\/+$/, "");
