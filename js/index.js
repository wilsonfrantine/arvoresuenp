document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.getElementById("splash").classList.add("hidden");
      document.body.classList.add("fade-in");
    }, 2000);
  });

  const galeria = document.getElementById("galeria-lista");
  const btnScan = document.getElementById("btnScan");
  const qrModal = document.getElementById("qrModal");
  const btnCancelScan = document.getElementById("btnCancelScan");
  const gallerySearch = document.getElementById("gallerySearch");
  const backToTop = document.getElementById("backToTop");

  // Expandir/ocultar texto
  const introText = document.getElementById("introText");
  const toggleIntro = document.getElementById("toggleIntro");
  toggleIntro?.addEventListener("click", () => {
    introText.classList.toggle("expanded");
    toggleIntro.innerText = introText.classList.contains("expanded") ? "Recolher" : "Ler mais";
  });

  const sobreText = document.getElementById("sobreText");
  const toggleSobre = document.getElementById("toggleSobre");
  toggleSobre?.addEventListener("click", () => {
    sobreText.classList.toggle("expanded");
    toggleSobre.innerText = sobreText.classList.contains("expanded") ? "Recolher" : "Ler mais";
  });

  let html5QrCode = null;

  async function carregarEspecies() {
    const planilhaURL = "https://docs.google.com/spreadsheets/d/1ci31Dvp85tYBla0vmiY_wRPQ4SUhihFrSuqw4JcWKQs/export?format=xlsx";
    try {
      const response = await fetch(planilhaURL);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      data.slice(0, 6).forEach((especie) => {
        const item = document.createElement("div");
        item.className = "galeria-item";
        item.innerHTML = `
          <img src="images/trees/${especie.imagem || ''}" alt="${especie.nome_popular}" 
            onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\'fallback-icon\'><i class=\'fas fa-tree\'></i></div>';">
          <p><strong>${especie.nome_popular}</strong><br><em>${especie.nome_cientifico}</em></p>
        `;
        galeria.appendChild(item);
      });
    } catch (err) {
      galeria.innerHTML = "<p>Erro ao carregar espécies.</p>";
      console.error(err);
    }
  }

  carregarEspecies();

  btnScan?.addEventListener("click", () => {
    qrModal.classList.remove("hidden");
    startQrScanner();
  });

  btnCancelScan?.addEventListener("click", () => {
    stopQrScanner();
    qrModal.classList.add("hidden");
  });

  function startQrScanner() {
    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          stopQrScanner();
          qrModal.classList.add("hidden");
          window.location.href = `queplantae.html?qrcode=${encodeURIComponent(decodedText)}`;
        }
      )
      .catch((err) => {
        console.error("Erro ao iniciar leitor QR:", err);
      });
  }

  function stopQrScanner() {
    if (html5QrCode) {
      html5QrCode.stop().then(() => html5QrCode.clear());
      html5QrCode = null;
    }
  }

  gallerySearch?.addEventListener("input", () => {
    const query = gallerySearch.value.toLowerCase();
    const items = document.querySelectorAll(".galeria-item");
    items.forEach((item) => {
      const texto = item.innerText.toLowerCase();
      item.style.display = texto.includes(query) ? "" : "none";
    });
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.remove("hidden");
    } else {
      backToTop.classList.add("hidden");
    }
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});