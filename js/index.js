document.addEventListener("DOMContentLoaded", async () => {
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.getElementById("splash").classList.add("hidden");
      document.body.classList.add("fade-in");
    }, 2000);
  });

  const galeria = document.getElementById("galeria-lista");
  const gallerySearch = document.getElementById("gallerySearch");

  // 1. Carregar mapa de imagens da segunda planilha
  const imagemMap = {};
  const imagemCSV = await fetch("https://docs.google.com/spreadsheets/d/1eJV7qlL97bByYz1lku38Xka-4P44g7-LPpCwBAEIPqc/export?format=csv").then(r => r.text());
  const linhas = imagemCSV.split("\n").slice(1);

  for (const linha of linhas) {
    const colunas = linha.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    const especieNome = colunas[1]?.trim();
    const imagens = colunas[2]?.split(",").map(s => s.trim().replace(/"/g, ""));

    if (especieNome && imagens?.length > 0) {
      const idMatch = imagens[0].match(/[-\w]{25,}/);
      if (idMatch) {
        imagemMap[especieNome] = `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
      }
    }
  }

  // 2. Carregar as espécies e montar a galeria
  async function carregarEspecies() {
    const planilhaURL = "https://docs.google.com/spreadsheets/d/1ci31Dvp85tYBla0vmiY_wRPQ4SUhihFrSuqw4JcWKQs/export?format=xlsx";
    try {
      const response = await fetch(planilhaURL);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      galeria.innerHTML = "";

      data.forEach((especie) => {
        const especieOriginal = especie.especie?.trim();
        const nomePopular = especie.nomepopular || "Sem nome";
        const imagemFinal = imagemMap[especieOriginal] || "images/fallback.png";

        // DEBUG:
        console.log("➡️ Buscando imagem para:", especieOriginal);
        console.log("📸 Encontrada:", imagemFinal);

        const item = document.createElement("div");
        item.className = "galeria-item";
        item.innerHTML = `
          <a href="queplantae.html?qrcode=${encodeURIComponent(especieOriginal)}">
            <img src="${imagemFinal}" alt="${nomePopular}" 
              onerror="this.onerror=null; this.src='images/fallback.png';">
          </a>
          <p><strong>${nomePopular}</strong><br><em>${especieOriginal}</em></p>
        `;
        galeria.appendChild(item);
      });
    } catch (err) {
      galeria.innerHTML = "<p>Erro ao carregar espécies.</p>";
      console.error("Erro ao buscar dados:", err);
    }
  }

  await carregarEspecies();

  // Filtro de busca
  if (gallerySearch) {
    gallerySearch.addEventListener("input", () => {
      const query = gallerySearch.value.toLowerCase();
      document.querySelectorAll(".galeria-item").forEach((item) => {
        const texto = item.innerText.toLowerCase();
        item.style.display = texto.includes(query) ? "" : "none";
      });
    });
  }

  // Botão de QR code
  const scanButton = document.getElementById("btnScan");
  const modal = document.getElementById("qrModal");
  const cancelBtn = document.getElementById("btnCancelScan");

  if (scanButton && modal) {
    scanButton.addEventListener("click", () => {
      modal.classList.remove("hidden");
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          window.location.href = `queplantae.html?qrcode=${encodeURIComponent(decodedText)}`;
          html5QrCode.stop();
        },
        (error) => {}
      ).catch((err) => {
        console.error("Erro ao iniciar câmera:", err);
      });
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.getElementById("qr-reader").innerHTML = "";
    });
  }
});
