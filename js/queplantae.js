document.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.getElementById('resultContainer');
    const specieDiv = document.getElementById('specie');
    const commonNameDiv = document.getElementById('commonName');
    const familyDiv = document.getElementById('family');
    const typeDiv = document.getElementById('type');
    const descricaoDiv = document.getElementById('descricao');

    function getQueryParam(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    }

    function formatQRCode(value) {
        return value.replace(/_/g, ' ');
    }

    async function fetchData(qrcode) {
        const url = "https://docs.google.com/spreadsheets/d/1ci31Dvp85tYBla0vmiY_wRPQ4SUhihFrSuqw4JcWKQs/export?format=xlsx";
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            const match = data.find(row => row.qrcode === qrcode);
            if (match) {
                commonNameDiv.textContent = match.nome_popular || '';
                specieDiv.textContent = match.nome_cientifico || '';
                familyDiv.textContent = match.familia || '';
                typeDiv.textContent = match.tipo || '';
                descricaoDiv.textContent = match.descricao || '';
            } else {
                resultContainer.innerHTML = "<p>Espécie não encontrada para este QR Code.</p>";
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            resultContainer.innerHTML = "<p>Erro ao carregar informações. Tente novamente mais tarde.</p>";
        }
    }

    const rawQRCode = getQueryParam('qrcode');
    if (rawQRCode) {
        const formattedQRCode = formatQRCode(rawQRCode);
        fetchData(formattedQRCode);
    } else {
        resultContainer.innerHTML = "<p>QR Code não fornecido na URL.</p>";
    }
});
