function carregarNotas(){

    let notas = JSON.parse(localStorage.getItem("notasEntrada") || "[]");

    let lista = document.getElementById("listaNotas");

    lista.innerHTML = "";

    notas.forEach((nota,i)=>{

        lista.innerHTML += `
        <tr>

            <td>${nota.numero}</td>
            <td>${nota.fornecedor}</td>
            <td>${nota.dataNota}</td>
            <td>R$ ${nota.valor}</td>
            <td>${nota.status}</td>

            <td>

                <button onclick="visualizarNota(${i})">👁️</button>

                <button onclick="excluirNota(${i})">🗑️</button>

            </td>

        </tr>
        `;

    });

}

function visualizarNota(i){

    let notas = JSON.parse(localStorage.getItem("notasEntrada"));

    let nota = notas[i];

    alert(
`Fornecedor: ${nota.fornecedor}

Nota: ${nota.numero}

Valor: R$ ${nota.valor}

Status: ${nota.status}

Produtos:
${nota.produtos.map(p=>p.produto+" ("+p.quantidade+")").join("\n")}`
    );

}

function excluirNota(i){

    if(!confirm("Excluir esta nota?")) return;

    let notas = JSON.parse(localStorage.getItem("notasEntrada"));

    notas.splice(i,1);

    localStorage.setItem("notasEntrada",JSON.stringify(notas));

    carregarNotas();

}

window.onload = carregarNotas;