let entradaProdutos = [];

function adicionarLinhaProduto(){

    entradaProdutos.push({
        codigo:"",
        produto:"",
        quantidade:1,
        custo:0,
        margem:40,
        venda:0
    });

    atualizarTabelaEntrada();
}

function atualizarTabelaEntrada(){

    let lista = document.getElementById("listaProdutosEntrada");

    lista.innerHTML = "";

    entradaProdutos.forEach((p,i)=>{

        lista.innerHTML += `
        <tr>

        <td>
        <input value="${p.codigo}"
        onchange="entradaProdutos[${i}].codigo=this.value">
        </td>

        <td>
        <input value="${p.produto}"
        onchange="entradaProdutos[${i}].produto=this.value">
        </td>

        <td>
        <input type="number"
        value="${p.quantidade}"
        onchange="entradaProdutos[${i}].quantidade=Number(this.value)">
        </td>

        <td>
        <input type="number"
        step="0.01"
        value="${p.custo}"
        onchange="calcularVenda(${i},this.value)">
        </td>

        <td>
        <input type="number"
        value="${p.margem}"
        onchange="entradaProdutos[${i}].margem=Number(this.value); atualizarTabelaEntrada();">
        </td>

        <td>
        <b>R$ ${Number(p.venda).toFixed(2)}</b>
        </td>

        <td>
        <button onclick="removerLinha(${i})">🗑️</button>
        </td>

        </tr>
        `;
    });

}

function calcularVenda(i,custo){

    custo = Number(custo);

    entradaProdutos[i].custo = custo;

    let margem = Number(entradaProdutos[i].margem);

    entradaProdutos[i].venda = custo + (custo * margem / 100);

    atualizarTabelaEntrada();
}

function removerLinha(i){

    entradaProdutos.splice(i,1);

    atualizarTabelaEntrada();
}
function salvarEntradaMercadoria(){

    let nota = {
        fornecedor: document.getElementById("fornecedor").value,
        numero: document.getElementById("numeroNota").value,
        dataNota: document.getElementById("dataNota").value,
        dataEntrada: document.getElementById("dataEntrada").value,
        valor: document.getElementById("valorNota").value,
        status: document.getElementById("statusNota").value,
        observacoes: document.getElementById("obsNota").value,
        produtos: entradaProdutos
    };

    let notas = JSON.parse(localStorage.getItem("notasEntrada") || "[]");

    notas.push(nota);

    localStorage.setItem("notasEntrada", JSON.stringify(notas));

    alert("Entrada registrada com sucesso!");

}