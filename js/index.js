document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.getElementById("splash").classList.add("hidden");
      document.body.classList.add("fade-in");
    }, 2000);
  });

  const galeria = document.getElementById("galeria-lista");
  const gallerySearch = document.getElementById("gallerySearch");

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
        const item = document.createElement("div");
        item.className = "galeria-item";
        const especieFormatada = especie.especie?.replace(/ /g, "_");
        const imgSrc = `images/trees/${especieFormatada || "placeholder"}.jpg`;

        item.innerHTML = `
        <a href="queplantae.html?qrcode=${especieFormatada}">
            <img src="images/trees/${especieFormatada || "placeholder"}.jpg" alt="${especie.nomepopular}" 
            onerror="this.onerror=null; this.src='images/fallback.png';">
        </a>
        <p><strong>${especie.nomepopular || "Sem nome"}</strong><br><em>${especie.especie || ""}</em></p>
        `;

        galeria.appendChild(item);
      });
    } catch (err) {
      galeria.innerHTML = "<p>Erro ao carregar espécies.</p>";
      console.error("Erro ao buscar dados:", err);
    }
  }

  carregarEspecies();

  gallerySearch?.addEventListener("input", () => {
    const query = gallerySearch.value.toLowerCase();
    const items = document.querySelectorAll(".galeria-item");
    items.forEach((item) => {
      const texto = item.innerText.toLowerCase();
      item.style.display = texto.includes(query) ? "" : "none";
    });
  });

  // Corrigir botão de QR Code
  const scanButton = document.getElementById("btnScan");
  const modal = document.getElementById("qrModal");
  const cancelBtn = document.getElementById("btnCancelScan");

  scanButton?.addEventListener("click", () => {
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

  cancelBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
    document.getElementById("qr-reader").innerHTML = "";
  });
});