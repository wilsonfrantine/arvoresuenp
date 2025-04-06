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

    const normalizar = (nome) => nome?.toLowerCase().replace(/[\s_]+/g, " ").trim();
    const especie = data.find((e) => normalizar(e.especie) === normalizar(qrCode));

    if (!especie) {
      resultContainer.innerHTML = "<p class='erro'>Espécie não encontrada.</p>";
      return;
    }

    await renderGaleriaEspecie(especie.especie);

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


// 🔽 BLOCO: Galeria de imagens da espécie
async function renderGaleriaEspecie(nomeEspecie) {
  const galeriaContainer = document.querySelector(".galeria-imagens");
  if (!galeriaContainer) return;

  const planilhaURL = "https://docs.google.com/spreadsheets/d/1eJV7qlL97bByYz1lku38Xka-4P44g7-LPpCwBAEIPqc/export?format=csv";
  const licencas = {
    "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
    "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
    "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
    "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
    "Minha imagem (uso educacional autorizado)": "https://creativecommons.org/licenses/by/4.0/"
  };

  try {
    const response = await fetch(planilhaURL);
    const csv = await response.text();
    const linhas = csv.split("\n").slice(1);

    const imagensEncontradas = [];

    for (const linha of linhas) {
      const colunas = linha.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
      const especie = colunas[1]?.trim();
      if (!especie || especie.toLowerCase() !== nomeEspecie.toLowerCase()) continue;

      const links = colunas[2]?.split(",").map(l => l.trim());
      const descricoes = colunas[3]?.split(";").map(d => d.trim());
      const autor = colunas[4]?.trim();
      const licenca = colunas[6]?.trim();
      const fonte = colunas[7]?.trim();
      const fonteLink = colunas[8]?.trim();

      if (!links || links.length === 0) continue;

      links.forEach((link, i) => {
        const idMatch = link.match(/[-\w]{25,}/);
        if (!idMatch) return;

        const imgUrl = `https://drive.google.com/uc?export=view&id=${idMatch[0]}`;
        const descricao = descricoes?.[i] || "";
        const nomeAutor = autor || "Autor desconhecido";
        const nomeFonte = fonte || "";
        const linkFonte = fonteLink || "";
        const linkLicenca = licencas[licenca] || null;

        const fig = document.createElement("figure");

        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = descricao;
        img.onerror = () => {
          img.onerror = null;
          img.src = "images/fallback.png";
        };        
        fig.appendChild(img);

        const caption = document.createElement("figcaption");
        let creditos = descricao ? `${descricao}<br>` : "";

        creditos += "Imagem por ";
        creditos += linkFonte
          ? `<a href="${linkFonte}" target="_blank">${nomeAutor}</a>`
          : nomeAutor;

        if (nomeFonte) {
          creditos += `, via ${nomeFonte}`;
        }

        if (linkLicenca) {
          creditos += `, sob <a href="${linkLicenca}" target="_blank">${licenca}</a>`;
        } else if (licenca) {
          creditos += `, sob ${licenca}`;
        }

        caption.innerHTML = creditos;
        fig.appendChild(caption);
        imagensEncontradas.push(fig);
      });
    }

    if (imagensEncontradas.length > 0) {
      imagensEncontradas.forEach(fig => galeriaContainer.appendChild(fig));
    } else {
      galeriaContainer.innerHTML = "<p>Nenhuma imagem encontrada para esta espécie.</p>";
    }
  } catch (err) {
    console.error("Erro ao carregar galeria:", err);
    galeriaContainer.innerHTML = "<p>Erro ao carregar galeria.</p>";
  }
}
