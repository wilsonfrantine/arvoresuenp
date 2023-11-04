document.addEventListener('DOMContentLoaded', function() {
    // Função para extrair o valor de um parâmetro da URL
    function obterValorParametro(nomeParametro) {
        var urlSearchParams = new URLSearchParams(window.location.search);
        return urlSearchParams.get(nomeParametro);
    }

    var valorQrcode = obterValorParametro('qrcode');

    // Substitui "_" por " " no valor do qrcode
    if (valorQrcode) {
        valorQrcode = valorQrcode.replace(/_/g, ' ');
    }

    var resultContainer = document.getElementById('resultContainer');
    var specieDiv = document.getElementById('specie');
    var commonNameDiv = document.getElementById('commonName');
    var familyDiv = document.getElementById('family');
    var typeDiv = document.getElementById('type');
    var descricaoDiv = document.getElementById('descricao');


    if (valorQrcode) {
        console.log(valorQrcode)
        // URL da planilha
        var urlPlanilha = "https://docs.google.com/spreadsheets/d/1ci31Dvp85tYBla0vmiY_wRPQ4SUhihFrSuqw4JcWKQs/export?format=xlsx";

        // Requisição para obter o conteúdo da planilha
        var xhr = new XMLHttpRequest();
        xhr.open("GET", urlPlanilha, true);
        xhr.responseType = "arraybuffer";

        xhr.onload = function(e) {
            var arraybuffer = xhr.response;

            // Converte os dados para um workbook
            var data = new Uint8Array(arraybuffer);
            var workbook = XLSX.read(data, {type: "array"});

            // Obtém a primeira folha do workbook
            var sheet_name_list = workbook.SheetNames;
            var sheet = workbook.Sheets[sheet_name_list[0]];

            // Percorre as células da coluna "especie" para encontrar a correspondência
            var range = XLSX.utils.decode_range(sheet["!ref"]);
            for (var R = range.s.r; R <= range.e.r; ++R) {
                var cell_address = {c:0, r:R}; // 1 é o índice da coluna "especie"
                var cell_ref = XLSX.utils.encode_cell(cell_address);
                var cell = sheet[cell_ref];
                if (cell && cell.v.toLowerCase() === valorQrcode.toLowerCase()) {
                    // Encontrou correspondência, obtenha a linha completa
                    var rowIndex = R;
                    var row = [];
                    for (var C = range.s.c; C <= range.e.c; ++C) {
                        var cell_address = {c:C, r:rowIndex};
                        var cell_ref = XLSX.utils.encode_cell(cell_address);
                        var cell = sheet[cell_ref];
                        row.push(cell ? cell.v : '');
                    }
                    // row agora contém os dados da linha correspondente
                    // resultContainer.textContent = row.join(', '); // Exemplo de exibição
                    specieDiv.innerHTML = '<span style="font-size:0.8em">Família:</span>' + '<h2><i>' + row[0] + '</i></h2>';
                    commonNameDiv.innerHTML = '<h2>' + row[2] + '</h2>' ;
                    familyDiv.innerHTML = '<span style="font-size:0.8em">Família:</span>' + '<h3>' + row[3] + '</h3>';
                    // typeDiv.textContent = "<span font-size=2vw>Aplicação: </span>"+ row[4];
                    descricaoDiv.innerHTML = '<h3>' + "Descrição: " + '</h3> <p></p>' + row[6];
                    
                    break; // Encerra a busca após encontrar a correspondência
                }
            }

            if (!resultContainer.textContent) {
                resultContainer.textContent = "Correspondência não encontrada.";
            }
        };

        xhr.send();
    } else {
        resultContainer.textContent = "QR Code não fornecido na URL.";
    }
});
