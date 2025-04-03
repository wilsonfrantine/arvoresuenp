window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) splash.classList.add("hidden");
    document.body.classList.add("fade-in");
  }, 2000);
});

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const qrCode = urlParams.get("qrcode");
  const resultContainer = document.getElementById("resultContainer");

  if (!qrCode) {
    resultContainer.innerHTML = "<p class='erro'>QR Code não fornecido na URL.</p>";
    return;
  }

  const planilhaURL = "https://docs.google.com/spreadsheets/d/1ci31Dvp85tYBla0vmiY_wRPQ4SUhihFrSuqw4JcWKQs/export?format=xlsx";

  try {
    const response = await fetch(planilhaURL);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const especie = data.find((e) => e.especie?.replace(/ /g, "_") === qrCode);

    if (!especie) {
      resultContainer.innerHTML = "<p class='erro'>Espécie não encontrada.</p>";
      return;
    }

    document.getElementById("commonName").innerHTML = `<h2>${especie.nomepopular || "Nome popular desconhecido"}</h2>`;
    document.getElementById("specie").innerHTML = `<p><strong>Espécie:</strong> <em>${especie.especie || "–"}</em> ${especie.descritor || ""}</p>`;
    document.getElementById("family").innerHTML = `<p><strong>Família:</strong> ${especie.familia || "–"}</p>`;
    document.getElementById("type").innerHTML = `<p><strong>Tipo:</strong> ${especie.tipo || "–"}</p>`;
    document.getElementById("descricao").innerHTML = especie.descricao || "";

    const toggle = document.getElementById("toggleDesc");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const desc = document.getElementById("descricao");
        desc.classList.toggle("expanded");
        toggle.innerText = desc.classList.contains("expanded") ? "Recolher" : "Ler mais";
      });
    }

    

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    resultContainer.innerHTML = "<p class='erro'>Erro ao carregar dados.</p>";
  }
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