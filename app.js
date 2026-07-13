console.log("APP NOVO CARREGADO");
let produtoPesoAtual = null;
let vendaSelecionada = null;
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let venda = [];
let pagamentos = [];
let historico = JSON.parse(localStorage.getItem("hist")) || [];
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let fiado = JSON.parse(localStorage.getItem("fiado")) || {};
let sangrias = JSON.parse(localStorage.getItem("sangrias")) || [];
let cancelamentos = JSON.parse(localStorage.getItem("cancelamentos")) || [];
let aberturaCaixa = Number(localStorage.getItem("aberturaCaixa")) || 0;
let vendasDia = Number(localStorage.getItem("vendasDia")) || 0;
let totalDia = Number(localStorage.getItem("totalDia")) || 0;
let caixaResumo = JSON.parse(localStorage.getItem("caixaResumo")) || {
 dinheiro:0,
 pix:0,
 cartao:0,
 fiado:0,
 delivery:0
};

let forma = "";

function salvar(){
 localStorage.setItem("produtos", JSON.stringify(produtos));
 localStorage.setItem("hist", JSON.stringify(historico));
 localStorage.setItem("clientes", JSON.stringify(clientes));
 localStorage.setItem("fiado", JSON.stringify(fiado));
 localStorage.setItem("sangrias", JSON.stringify(sangrias));
 localStorage.setItem("cancelamentos", JSON.stringify(cancelamentos));
 localStorage.setItem("caixaResumo", JSON.stringify(caixaResumo));
 localStorage.setItem("aberturaCaixa", aberturaCaixa);
}

function fechar(id){
 document.getElementById(id).style.display = "none";
}

function beep(){
 try{
  let ctx = new (window.AudioContext || window.webkitAudioContext)();
  let osc = ctx.createOscillator();
  osc.frequency.value = 800;
  osc.connect(ctx.destination);
  osc.start();
  setTimeout(()=>osc.stop(),100);
 }catch(e){}
}

setInterval(()=>{
 document.getElementById("hora").innerText = new Date().toLocaleTimeString();
},1000);

function atualizar(){
 let lista = document.getElementById("lista");
 lista.innerHTML = "";

 let totalVenda = 0;

 venda.forEach((v,i)=>{
  lista.innerHTML += `
   <tr>
    <td>${v.img ? `<img src="${v.img}" width="40">` : ""}</td>
    <td>${v.codigo}</td>
    <td>${v.nome}</td>
    <td>${v.qtd}</td>
    <td>R$ ${(v.preco * v.qtd).toFixed(2)}</td>
    <td><button onclick="remover(${i})">X</button></td>
   </tr>
  `;

  totalVenda += v.preco * v.qtd;
 });

 document.getElementById("total").innerText = totalVenda.toFixed(2);
 document.getElementById("totalPagamento").innerText = totalVenda.toFixed(2);
 document.getElementById("cTotal").innerText = totalVenda.toFixed(2);
 document.getElementById("cItens").innerText = venda.length;
 document.getElementById("cProd").innerText = produtos.length;
 document.getElementById("cVenda").innerText = vendasDia;
document.getElementById("cTotal").innerText = totalDia.toFixed(2);
 document.getElementById("cFiado").innerText = Object.keys(fiado).length;

 let pago = parseFloat(document.getElementById("valorPago").value || 0);
 document.getElementById("troco").innerText = (pago - totalVenda).toFixed(2);

 let ultima = historico[historico.length - 1];

 document.getElementById("ultimaVenda").innerText =
  ultima ? "🧾 Última venda: R$ " + Number(ultima.total).toFixed(2) : "Última venda: Nenhuma";

 carregarGrid();
}

function carregarGrid(){
 let grid = document.getElementById("gridProdutos");
 grid.innerHTML = "";

 produtos.forEach(p=>{
  grid.innerHTML += `
   <div class="prod" onclick="adicionar('${p.codigo}',1)">
    ${p.img ? `<img src="${p.img}">` : ""}
    <br>
    <b>${p.nome}</b><br>
    ${p.codigo}<br>
    R$ ${Number(p.preco).toFixed(2)}
   </div>
  `;
 });
}

function adicionar(cod,qtd){
 let p = produtos.find(x =>
  String(x.codigo) === String(cod) ||
  String(x.nome).toLowerCase() === String(cod).toLowerCase()
 );
 if(!p){
  alert("Produto não encontrado");
  return;
 }// Produto vendido por peso
if(p.porPeso){

    produtoPesoAtual = p;

    pesarProduto();

    return;

}


 let item = venda.find(v => String(v.codigo) === String(p.codigo));

 if(item){
  item.qtd += qtd;
 }else{
  venda.push({...p, qtd:qtd});
 }

 p.estoque = Number(p.estoque || 0) - qtd;

 salvar();
 beep();
 atualizar();
}

function remover(i){
 let item = venda[i];
 let produto = produtos.find(p => String(p.codigo) === String(item.codigo));

 if(produto){
  produto.estoque += item.qtd;
 }

 venda.splice(i,1);
 salvar();
 atualizar();
}

document.getElementById("busca").addEventListener("keydown", function(e){
 if(e.key !== "Enter") return;

 let val = this.value.trim().replace(",", ".");

 if(!val) return;

 if(val.includes("*")){
  let partes = val.split("*");
  adicionar(partes[1], parseInt(partes[0]));
 }
 else if(!isNaN(val) && val.length < 8){
  venda.push({
   nome:"Avulso",
   codigo:"AV",
   preco:parseFloat(val),
   qtd:1
  });
  beep();
 }
 else{
  adicionar(val,1);
 }

 this.value = "";
 atualizar();
});

function abrirProdutos(){
 document.getElementById("mProdutos").style.display = "flex";
 listarProdutos();
}

function salvarProduto(){
 let nome = document.getElementById("nome").value;
 let codigo = document.getElementById("codigo").value;
 let preco = parseFloat(document.getElementById("preco").value.replace(",", "."));
 let estoque = parseInt(document.getElementById("estoque").value);
 let img = document.getElementById("img").value;

 if(!nome || !codigo || isNaN(preco)){
  alert("Preencha nome, código e preço");
  return;
 }

 produtos.push({
  nome,
  codigo,
  preco,
  estoque:isNaN(estoque) ? 0 : estoque,
  img,
porPeso: document.getElementById("produtoPorPeso").checked
 });

 document.getElementById("nome").value = "";
 document.getElementById("codigo").value = "";
 document.getElementById("preco").value = "";
 document.getElementById("estoque").value = "";
 document.getElementById("img").value = "";

 salvar();
 listarProdutos();
 atualizar();
}

function listarProdutos(){
 let lista = document.getElementById("listaProdutos");
 lista.innerHTML = "";

 produtos.forEach((p,i)=>{
  lista.innerHTML += `
   <div style="padding:10px;margin-bottom:10px;background:#f8fafc;border-radius:8px;border:1px solid #ddd;">
    ${p.img ? `<img src="${p.img}" width="50">` : ""}
    <br>
    <b>${p.nome}</b><br>
    Código: ${p.codigo}<br>
    Preço: R$ ${Number(p.preco).toFixed(2)}<br>
    Estoque: <b style="color:${p.estoque <= 5 ? "red" : "green"}">${p.estoque}</b>
    ${p.estoque <= 5 ? " ⚠️ Baixo" : ""}
    <br><br>
    <button onclick="editarProduto(${i})">Editar</button>
    <button onclick="reporEstoque(${i})">Repor</button>
    <button onclick="excluirProduto(${i})">Excluir</button>
   </div>
  `;
 });
}

function editarProduto(i){
 let novoNome = prompt("Nome:", produtos[i].nome);
 if(!novoNome) return;

 let novoCodigo = prompt("Código:", produtos[i].codigo);
 if(!novoCodigo) return;

 let novoPreco = prompt("Preço:", produtos[i].preco);
 if(!novoPreco) return;

 novoPreco = parseFloat(novoPreco.replace(",", "."));

 if(isNaN(novoPreco)){
  alert("Preço inválido");
  return;
 }

 produtos[i].nome = novoNome;
 produtos[i].codigo = novoCodigo;
 produtos[i].preco = novoPreco;

 salvar();
 listarProdutos();
 atualizar();
}

function reporEstoque(i){
 let qtd = parseInt(prompt("Quantidade para adicionar:", "1"));

 if(isNaN(qtd) || qtd <= 0){
  alert("Quantidade inválida");
  return;
 }

 produtos[i].estoque += qtd;
 salvar();
 listarProdutos();
 atualizar();
}

function excluirProduto(i){
 if(!confirm("Excluir produto?")) return;

 produtos.splice(i,1);
 salvar();
 listarProdutos();
 atualizar();
}

function abrirAvulso(){
 document.getElementById("mAvulso").style.display = "flex";
 document.getElementById("valorAvulso").focus();
}

function confirmarAvulso(){
 let valor = parseFloat(document.getElementById("valorAvulso").value.replace(",", "."));

 if(isNaN(valor) || valor <= 0){
  alert("Valor inválido");
  return;
 }

 venda.push({
  nome:"Venda Avulsa",
  codigo:"AV",
  preco:valor,
  qtd:1
 });

 document.getElementById("valorAvulso").value = "";
 fechar("mAvulso");
 atualizar();
}

function setForma(f){
 forma = f;

 let totalVenda = parseFloat(document.getElementById("total").innerText);

 if(totalVenda <= 0){
  alert("Nenhuma venda em aberto");
  return;
 }

 if(f === "Fiado"){
  let nomes = clientes.map(c => c.nome).join("\n");

  let cliente = prompt("Digite o nome do cliente:\n\n" + nomes);

  if(!cliente) return;

  if(!fiado[cliente]){
   fiado[cliente] = 0;
  }

  fiado[cliente] += totalVenda;
  caixaResumo.fiado += totalVenda;

  document.getElementById("valorPago").value = totalVenda.toFixed(2);
  document.getElementById("troco").innerText = "0.00";

  salvar();
  alert("Fiado lançado para " + cliente);
  return;
 }

 let valor = prompt("Valor em " + f + ":", totalVenda.toFixed(2));

 if(valor === null) return;

 valor = parseFloat(valor.replace(",", "."));

 if(isNaN(valor) || valor <= 0){
  alert("Valor inválido");
  return;
 }

 pagamentos.push({
  tipo:f,
  valor:valor
 });

 let pago = pagamentos.reduce((s,p)=>s+p.valor,0);

 document.getElementById("valorPago").value = pago.toFixed(2);
 document.getElementById("troco").innerText = (pago - totalVenda).toFixed(2);
}

function finalizarVenda(){
 if(venda.length === 0){
  alert("Nenhum item na venda");
  return;
 }

 let totalVenda = venda.reduce((s,v)=>s + (v.preco * v.qtd),0);

 if(pagamentos.length === 0 && forma !== "Fiado"){
  alert("Selecione a forma de pagamento");
  return;
 }

 pagamentos.forEach(p=>{
  if(p.tipo === "Dinheiro") caixaResumo.dinheiro += p.valor;
  if(p.tipo === "Pix") caixaResumo.pix += p.valor;
  if(p.tipo === "Cartão") caixaResumo.cartao += p.valor;
 });

 historico.push({
  itens:[...venda],
  total:totalVenda,
  pagamentos:[...pagamentos],
  forma:forma,
  data:new Date().toISOString()
 });
vendasDia++;
totalDia += totalVenda;

localStorage.setItem("vendasDia", vendasDia);
localStorage.setItem("totalDia", totalDia);
 salvar();

 alert("Venda finalizada!");

 if(confirm("Imprimir cupom?")){
  imprimirCupom(totalVenda);
 }

 venda = [];
 pagamentos = [];
 forma = "";
 document.getElementById("valorPago").value = "";

 atualizar();
}

function imprimirCupom(totalVenda){
 let texto = "SWEETCAKE PDV\n";
 texto += "CUPOM NÃO FISCAL\n\n";

 venda.forEach(v=>{
  texto += v.nome + "\n";
  texto += v.qtd + " x R$ " + Number(v.preco).toFixed(2) + "\n";
  texto += "R$ " + (v.qtd * v.preco).toFixed(2) + "\n\n";
 });

 texto += "TOTAL: R$ " + totalVenda.toFixed(2) + "\n";
 texto += new Date().toLocaleString();

 let tela = window.open("", "", "width=300,height=600");
 tela.document.write("<pre>" + texto + "</pre>");
 tela.document.close();
 tela.print();
}

function abrirCaixa(){
 let valor = prompt("Valor inicial do caixa:");

 if(valor === null) return;

 valor = parseFloat(valor.replace(",", "."));

 if(isNaN(valor)){
  alert("Valor inválido");
  return;
 }

 aberturaCaixa = valor;
 localStorage.setItem("aberturaCaixa", aberturaCaixa);

 alert("Caixa aberto com R$ " + valor.toFixed(2));
}

function fazerSangria(){
 let valor = prompt("Valor da sangria:");

 if(valor === null) return;

 valor = parseFloat(valor.replace(",", "."));

 if(isNaN(valor) || valor <= 0){
  alert("Valor inválido");
  return;
 }

 let motivo = prompt("Motivo da sangria:") || "Sem motivo";

 sangrias.push({
  valor,
  motivo,
  data:new Date().toISOString()
 });

 salvar();

 alert("Sangria registrada");
}

function fecharCaixa(){
 let contado = prompt("Valor contado em dinheiro no caixa:");

 if(contado === null) return;

 contado = parseFloat(contado.replace(",", "."));

 if(isNaN(contado)){
  alert("Valor inválido");
  return;
 }

 let dinheiro = Number(caixaResumo.dinheiro || 0);
 let pix = Number(caixaResumo.pix || 0);
 let cartao = Number(caixaResumo.cartao || 0);
 let fiadoVenda = Number(caixaResumo.fiado || 0);
 let delivery = Number(caixaResumo.delivery || 0);

 let totalSangrias = sangrias.reduce((s,x)=>s + Number(x.valor || 0),0);
 let totalCancelamentos = cancelamentos.length;

 let totalVendido = dinheiro + pix + cartao + fiadoVenda + delivery;
 let esperado = aberturaCaixa + dinheiro - totalSangrias;
 let diferenca = contado - esperado;

 let texto =
`FECHAMENTO DE CAIXA

Data:
${new Date().toLocaleString()}

Abertura:
R$ ${aberturaCaixa.toFixed(2)}

Dinheiro:
R$ ${dinheiro.toFixed(2)}

Pix:
R$ ${pix.toFixed(2)}

Cartão:
R$ ${cartao.toFixed(2)}

Fiado:
R$ ${fiadoVenda.toFixed(2)}

Delivery:
R$ ${delivery.toFixed(2)}

Sangrias:
R$ ${totalSangrias.toFixed(2)}

Cancelamentos:
${totalCancelamentos}

Total vendido:
R$ ${totalVendido.toFixed(2)}

Contado:
R$ ${contado.toFixed(2)}

Esperado em dinheiro:
R$ ${esperado.toFixed(2)}

Diferença:
R$ ${diferenca.toFixed(2)}
`;

 document.getElementById("textoFechamento").innerText = texto;
 document.getElementById("mFechamento").style.display = "flex";
 localStorage.setItem("ultimoFechamentoTexto", texto);
}

function imprimirFechamento(){
 let texto = localStorage.getItem("ultimoFechamentoTexto") || "";

 let tela = window.open("", "", "width=400,height=700");
 tela.document.write("<pre style='font-family:monospace;font-size:14px;'>" + texto + "</pre>");
 tela.document.close();
 tela.print();
}

function confirmarZerarCaixa(){
 if(!confirm("Zerar caixa agora?")) return;

 caixaResumo = {
  dinheiro:0,
  pix:0,
  cartao:0,
  fiado:0,
  delivery:0
 };

 aberturaCaixa = 0;
 sangrias = [];
 cancelamentos = [];
vendasDia = 0;
totalDia = 0;

localStorage.setItem("vendasDia", 0);
localStorage.setItem("totalDia", 0);
 salvar();

 fechar("mFechamento");
 atualizar();

 alert("Caixa zerado");
}

function cancelarItemVenda(){
 if(venda.length === 0){
  alert("Nenhum item na venda");
  return;
 }

 let lista = document.getElementById("listaCancelarItem");
 lista.innerHTML = "";

 venda.forEach((v,i)=>{
  lista.innerHTML += `
   <div style="padding:10px;margin-bottom:10px;background:#f1f5f9;border-radius:8px;">
    <b>${v.nome}</b><br>
    Qtd: ${v.qtd}<br>
    Total: R$ ${(v.preco * v.qtd).toFixed(2)}<br><br>
    <button onclick="confirmarCancelarItem(${i})">Cancelar este item</button>
   </div>
  `;
 });

 document.getElementById("mCancelarItem").style.display = "flex";
}

function confirmarCancelarItem(i){
 let motivo = prompt("Motivo do cancelamento:");

 if(!motivo) return;

 let item = venda[i];

 cancelamentos.push({
  item:item,
  motivo:motivo,
  data:new Date().toISOString()
 });

 let produto = produtos.find(p => String(p.codigo) === String(item.codigo));

 if(produto){
  produto.estoque += item.qtd;
 }

 venda.splice(i,1);

 salvar();
 atualizar();
 fechar("mCancelarItem");

 alert("Item cancelado");
}

function cancelarUltimaVenda(){
 if(historico.length === 0){
  alert("Nenhuma venda para cancelar");
  return;
 }

 if(!confirm("Cancelar última venda?")) return;

 let ultima = historico.pop();

 ultima.itens.forEach(item=>{
  let produto = produtos.find(p => String(p.codigo) === String(item.codigo));

  if(produto){
   produto.estoque += item.qtd;
  }
 });

 cancelamentos.push({
  tipo:"Venda inteira",
  venda:ultima,
  data:new Date().toISOString()
 });

 salvar();
 atualizar();

 alert("Última venda cancelada");
}

function abrirClientes(){
 document.getElementById("mClientes").style.display = "flex";
 listarClientes();
}

function salvarCliente(){
 let nome = document.getElementById("clienteNome").value;
 let telefone = document.getElementById("clienteTelefone").value;
 let endereco = document.getElementById("clienteEndereco").value;

 if(!nome){
  alert("Digite o nome");
  return;
 }

 clientes.push({nome, telefone, endereco});

 document.getElementById("clienteNome").value = "";
 document.getElementById("clienteTelefone").value = "";
 document.getElementById("clienteEndereco").value = "";

 salvar();
 listarClientes();
}

function listarClientes(){
 let lista = document.getElementById("listaClientes");
 lista.innerHTML = "";

 clientes.forEach(c=>{
  lista.innerHTML += `
   <div style="padding:10px;margin-bottom:10px;background:#f1f5f9;border-radius:8px;">
    <b>${c.nome}</b><br>
    ${c.telefone}<br>
    ${c.endereco}
   </div>
  `;
 });
}

function abrirFiado(){
 document.getElementById("mFiado").style.display = "flex";

 let lista = document.getElementById("listaFiado");
 lista.innerHTML = "";

 for(let c in fiado){
  lista.innerHTML += `
   <div style="padding:10px;margin-bottom:10px;background:#f1f5f9;border-radius:8px;">
    <b>${c}</b><br>
    Dívida: R$ ${Number(fiado[c]).toFixed(2)}<br><br>
    <button onclick="receberFiado('${c}')">Receber</button>
   </div>
  `;
 }
}

function receberFiado(cliente){
 let valor = prompt("Valor recebido de " + cliente);

 if(valor === null) return;

 valor = parseFloat(valor.replace(",", "."));

 if(isNaN(valor) || valor <= 0){
  alert("Valor inválido");
  return;
 }

 fiado[cliente] -= valor;

 if(fiado[cliente] <= 0){
  delete fiado[cliente];
 }

 caixaResumo.dinheiro += valor;

 salvar();
 abrirFiado();
 atualizar();
}

function fazerBackup(){
 let dados = {
  produtos,
  historico,
  clientes,
  fiado,
  caixaResumo,
  aberturaCaixa,
  sangrias,
  cancelamentos
 };

 let blob = new Blob([JSON.stringify(dados,null,2)], {
  type:"application/json"
 });

 let link = document.createElement("a");
 link.href = URL.createObjectURL(blob);
 link.download = "backup_pdv_sweetcake.json";
 link.click();
}

function importarBackup(){
 let input = document.createElement("input");
 input.type = "file";
 input.accept = ".json";

 input.onchange = function(e){
  let arquivo = e.target.files[0];
  let leitor = new FileReader();

  leitor.onload = function(ev){
   let dados = JSON.parse(ev.target.result);

   produtos = dados.produtos || [];
   historico = dados.historico || [];
   clientes = dados.clientes || [];
   fiado = dados.fiado || {};
   caixaResumo = dados.caixaResumo || {dinheiro:0,pix:0,cartao:0,fiado:0,delivery:0};
   aberturaCaixa = dados.aberturaCaixa || 0;
   sangrias = dados.sangrias || [];
   cancelamentos = dados.cancelamentos || [];

   salvar();
   alert("Backup importado");
   location.reload();
  };

  leitor.readAsText(arquivo);
 };

 input.click();
}

window.addEventListener("keydown", function(e){
 if(e.key === "F1"){
  e.preventDefault();
  setForma("Dinheiro");
 }

 if(e.key === "F2"){
  e.preventDefault();
  setForma("Pix");
 }

 if(e.key === "F3"){
  e.preventDefault();
  setForma("Cartão");
 }

 if(e.key === "F4"){
  e.preventDefault();
  setForma("Fiado");
 }

 if(e.key === "F6"){
  e.preventDefault();
  finalizarVenda();
 }

 if(e.key === "F7"){
  e.preventDefault();
  cancelarItemVenda();
 }
if(e.key == "F8"){

    e.preventDefault();

    pesarProduto();

}
 if(e.key === "Enter"){
  if(document.activeElement.id === "valorAvulso"){
   confirmarAvulso();
  }
  else if(document.activeElement.id === "valorPago"){
   finalizarVenda();
  }
 }
});

window.onload = function(){
 carregarGrid();
 atualizar();

 setTimeout(()=>{
  document.getElementById("busca").focus();
 },500);
};
let usuarioLogado = null;
let nivelUsuario = null;

function fazerLogin(){
 let usuario = document.getElementById("usuario").value.trim();
 let senha = document.getElementById("senha").value.trim();

 if(usuario === "admin" && senha === "123456"){
  usuarioLogado = "Administrador";
  nivelUsuario = "admin";

  localStorage.setItem("usuarioLogado", usuarioLogado);
  localStorage.setItem("nivelUsuario", nivelUsuario);

  document.getElementById("loginTela").style.display = "none";

  alert("Bem-vindo Administrador");
  return;
 }

let usuarioAdmin = localStorage.getItem("adminUsuario") || "admin";
let senhaAdmin = localStorage.getItem("adminSenha") || "123456";

if(usuario == usuarioAdmin && senha == senhaAdmin){
  usuarioLogado = "Caixa 1";
  nivelUsuario = "funcionario";

  localStorage.setItem("usuarioLogado", usuarioLogado);
  localStorage.setItem("nivelUsuario", nivelUsuario);

  document.getElementById("loginTela").style.display = "none";

  alert("Bem-vindo Caixa 1");
  return;
 }

 alert("Usuário ou senha incorretos!");
}

window.addEventListener("load", function(){

    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nivelUsuario");

    if(localStorage.getItem("instalado") == "sim"){

        document.getElementById("loginTela").style.display = "flex";
        document.getElementById("instalacaoTela").style.display = "none";

    }else{

        document.getElementById("loginTela").style.display = "none";
        document.getElementById("instalacaoTela").style.display = "flex";

    }
        aplicarPersonalizacao();

});
function abrirConfiguracoes(){

 document.getElementById("mConfiguracoes").style.display="flex";

}
function abrirEmpresa(){

document.getElementById("mEmpresa").style.display="flex";
document.getElementById("usarBalanca").checked =
localStorage.getItem("usarBalanca")=="true";

document.getElementById("modeloBalanca").value =
localStorage.getItem("modeloBalanca") || "Automático";

document.getElementById("portaBalanca").value =
localStorage.getItem("portaBalanca") || "Automática";

document.getElementById("velocidadeBalanca").value =
localStorage.getItem("velocidadeBalanca") || "Automática";
}
function salvarEmpresa(){

const empresa={

nome:document.getElementById("empresaNome").value,

fantasia:document.getElementById("empresaFantasia").value,

cnpj:document.getElementById("empresaCnpj").value,

telefone:document.getElementById("empresaTelefone").value,

endereco:document.getElementById("empresaEndereco").value,

cidade:document.getElementById("empresaCidade").value,

estado:document.getElementById("empresaEstado").value

};

localStorage.setItem("empresa",JSON.stringify(empresa));
localStorage.setItem(
    "usarBalanca",
    document.getElementById("usarBalanca").checked
);

localStorage.setItem(
    "modeloBalanca",
    document.getElementById("modeloBalanca").value
);

localStorage.setItem(
    "portaBalanca",
    document.getElementById("portaBalanca").value
);

localStorage.setItem(
    "velocidadeBalanca",
    document.getElementById("velocidadeBalanca").value
);
alert("Dados salvos com sucesso!");

fechar("mEmpresa");

}
function abrirBalanca(){
    document.getElementById("mBalanca").style.display = "flex";
}

function salvarBalanca(){

    const config = {
        modelo: document.getElementById("balancaModelo").value,
        conexao: document.getElementById("balancaConexao").value,
        porta: document.getElementById("balancaCom").value,
        velocidade: document.getElementById("balancaBaud").value
    };

    localStorage.setItem("configBalanca", JSON.stringify(config));

    alert("Configuração da balança salva com sucesso!");
}
let balancaConectada = false;
let pesoAtual = 0;

function iniciarBalanca(){

    const cfg = JSON.parse(localStorage.getItem("configBalanca"));

    if(!cfg){
        console.log("Nenhuma balança configurada.");
        return;
    }

    console.log("Modelo:", cfg.modelo);
    console.log("Conexão:", cfg.conexao);
    console.log("Porta:", cfg.porta);
    console.log("Velocidade:", cfg.velocidade);

    // Aqui entraremos com a leitura da balança real.
}

window.addEventListener("load", iniciarBalanca);
function abrirRelatorioVendas(){

 document.getElementById("mRelatorio").style.display="flex";

}
function pesquisarVendas(){

    let historico = JSON.parse(localStorage.getItem("hist")) || [];

    let lista = document.getElementById("listaRelatorio");

    if(historico.length == 0){
        lista.innerHTML = "Nenhuma venda encontrada.";
        return;
    }

    let html = "";
let totalDia = historico.reduce((s, v) => s + Number(v.total || 0), 0);
let qtdVendas = historico.length;
let ticketMedio = qtdVendas ? (totalDia / qtdVendas).toFixed(2) : "0.00";

html += `
<div style="
background:#eef7ff;
border:1px solid #cce5ff;
padding:12px;
border-radius:10px;
margin-bottom:15px;
font-size:16px;
line-height:1.8;
">
<b>💰 Total vendido no dia:</b> R$ ${totalDia.toFixed(2)}<br>
<b>🧾 Quantidade de vendas:</b> ${qtdVendas}<br>
<b>💵 Ticket médio:</b> R$ ${ticketMedio}
</div>
`;

    historico.forEach((venda, i)=>{

 html += `
<div style="border:1px solid #ccc;padding:10px;margin-bottom:10px;border-radius:8px">

<b>Venda ${i+1}</b><br>

${new Date(venda.data).toLocaleString("pt-BR")}<br>

Total: R$ ${venda.total}<br>

Forma: ${venda.forma || ""}<br><br>

<button onclick="verVenda(${i})">
👁️ Ver Venda
</button>

</div>
`;
    });

    lista.innerHTML = html;

}
function verVenda(indice){

    let venda = historico[indice];
vendaSelecionada = venda;

    let html = "";

    html += "<b>Data:</b> " + new Date(venda.data).toLocaleString("pt-BR") + "<br>";
    html += "<b>Forma:</b> " + venda.forma + "<br>";
    html += "<b>Total:</b> R$ " + venda.total + "<hr>";

    venda.itens.forEach(item=>{

        html += "<b>"+item.nome+"</b><br>";
        html += "Qtd: "+item.qtd+"<br>";
        html += "Preço: R$ "+item.preco+"<hr>";

    });

    document.getElementById("conteudoVenda").innerHTML = html;

    document.getElementById("mVerVenda").style.display="flex";

}
function reimprimirVenda(){

    if(!vendaSelecionada){
        alert("Nenhuma venda selecionada.");
        return;
    }

    let texto = "";

    texto += "SMARTPDV\n";
    texto += "----------------------\n";

    texto += "Data: " + new Date(vendaSelecionada.data).toLocaleString("pt-BR") + "\n\n";

    vendaSelecionada.itens.forEach(item=>{

        texto += item.nome + "\n";
        texto += item.qtd + " x R$ " + item.preco + "\n\n";

    });

    texto += "----------------------\n";
    texto += "TOTAL: R$ " + vendaSelecionada.total;

    let w = window.open("", "", "width=300,height=600");

    w.document.write("<pre>"+texto+"</pre>");

    w.print();

    w.close();

}
function imprimirRelatorio(){

    let historico = JSON.parse(localStorage.getItem("hist")) || [];

    let total = historico.reduce((s,v)=>s+Number(v.total||0),0);
    let qtd = historico.length;
    let ticket = qtd ? (total/qtd).toFixed(2) : "0.00";

    let texto = "";

    texto += "SMARTPDV\n";
    texto += "RELATÓRIO DE VENDAS\n\n";

    texto += "Total vendido: R$ " + total.toFixed(2) + "\n";
    texto += "Número de vendas: " + qtd + "\n";
    texto += "Ticket médio: R$ " + ticket + "\n\n";

    texto += "Emitido em:\n";
    texto += new Date().toLocaleString("pt-BR");

    let w = window.open("", "", "width=300,height=600");

    w.document.write("<pre>"+texto+"</pre>");

    w.print();

    w.close();

}
function abrirConsultaPreco(){

    document.getElementById("mConsultaPreco").style.display="flex";

    document.getElementById("codigoConsulta").focus();

}
function concluirInstalacao(){

    let empresa = document.getElementById("instEmpresa").value.trim();
    let usuario = document.getElementById("instUsuario").value.trim();
    let senha = document.getElementById("instSenha").value.trim();

    if(empresa=="" || usuario=="" || senha==""){
        alert("Preencha todos os campos.");
        return;
    }

    localStorage.setItem("empresaNome", empresa);
    localStorage.setItem("adminUsuario", usuario);
    localStorage.setItem("adminSenha", senha);

    localStorage.setItem("instalado","sim");

    alert("Instalação concluída com sucesso!");

   document.getElementById("instalacaoTela").style.display="none";
document.getElementById("instalacaoEmpresa").style.display="flex";

}
function proximaEtapaEmpresa(){

    localStorage.setItem("empresaNome",
        document.getElementById("empresaNome2").value);

    localStorage.setItem("empresaFantasia",
        document.getElementById("empresaFantasia2").value);

    localStorage.setItem("empresaCnpj",
        document.getElementById("empresaCnpj2").value);

    localStorage.setItem("empresaTelefone",
        document.getElementById("empresaTelefone2").value);

    localStorage.setItem("empresaEndereco",
        document.getElementById("empresaEndereco2").value);

    localStorage.setItem("empresaCidade",
        document.getElementById("empresaCidade2").value);

    localStorage.setItem("empresaEstado",
        document.getElementById("empresaEstado2").value);

    document.getElementById("instalacaoEmpresa").style.display="none";

    document.getElementById("instalacaoImpressora").style.display="flex";

}
function proximaEtapaImpressora(){

localStorage.setItem(
"modeloImpressora",
document.getElementById("instImpressora").value
);

localStorage.setItem(
"balancaModelo",
document.getElementById("instBalanca").value
);

localStorage.setItem(
"balancaCom",
document.getElementById("instCom").value
);

document.getElementById("instalacaoImpressora").style.display="none";
document.getElementById("instalacaoPersonalizar").style.display="flex";
}
function finalizarInstalacao(){

    localStorage.setItem("instalado","sim");

    document.getElementById("instalacaoPersonalizar").style.display="none";

    document.getElementById("loginTela").style.display="flex";

    alert("Instalação concluída com sucesso!");

}
function salvarPersonalizacao(){

    localStorage.setItem(
        "corSistema",
        document.getElementById("corSistema").value
    );

    let arquivo =
        document.getElementById("logoEmpresa").files[0];

    if(arquivo){

        let leitor = new FileReader();

        leitor.onload=function(e){

            localStorage.setItem(
                "logoEmpresa",
                e.target.result
            );

            finalizarInstalacao();

        };

        leitor.readAsDataURL(arquivo);

    }else{

        finalizarInstalacao();

    }

}
function aplicarPersonalizacao(){

    let nome = localStorage.getItem("empresaFantasia");
    let logo = localStorage.getItem("logoEmpresa");

    if(nome){
        document.getElementById("tituloSistema").innerText = nome;
    }

    if(logo){
        let img = document.getElementById("logoTopo");
        img.src = logo;
        img.style.display = "inline-block";
    }

}
function procurarBalanca(){

    document.getElementById("statusBalanca").innerHTML =
    "🔍 Procurando balança...";

    alert("Em breve o SmartPDV irá procurar automaticamente a balança.");

}

async function procurarBalanca(){

    if(!("serial" in navigator)){
        alert("Este navegador não suporta comunicação serial.");
        return;
    }

    try{

        portaBalanca = await navigator.serial.requestPort();
        const velocidades = [9600,19200,38400,4800,115200];

        for(let velocidade of velocidades){

            try{

               portaBalanca.open({
                    baudRate: velocidade
                });

                localStorage.setItem("portaBalanca","detectada");
                localStorage.setItem("velocidadeBalanca",velocidade);

                document.getElementById("statusBalanca").innerHTML =
                "✅ Balança encontrada ("+velocidade+" bps)";

                portaBalanca.close();
                return;

            }catch(e){}

        }

        document.getElementById("statusBalanca").innerHTML =
        "❌ Não foi possível identificar a balança.";

    }catch(e){

        document.getElementById("statusBalanca").innerHTML =
        "Operação cancelada.";

    }

}
let portaBalanca = null;

async function lerPesoBalanca(){

    if(!portaBalanca){
        alert("Nenhuma balança conectada.");
        return null;
    }

    try{

        const leitor = portaBalanca.readable.getReader();

        const {value} = await leitor.read();

        leitor.releaseLock();

        let texto = new TextDecoder().decode(value);

        console.log("Dados recebidos:", texto);

        return texto;

    }catch(e){

        console.log(e);

        return null;

    }

}
async function pesarProduto(){

    if(!produtoPesoAtual){
        alert("Nenhum produto por peso selecionado.");
        return;
    }

    let peso = await lerPesoBalanca();

    if(peso == null){

        let pesoManual = prompt("Digite o peso (Kg):");

        if(!pesoManual) return;

        peso = parseFloat(pesoManual.replace(",", "."));

    }

    if(isNaN(peso) || peso <= 0){
        alert("Peso inválido.");
        return;
    }

    venda.push({
        nome: produtoPesoAtual.nome,
        codigo: produtoPesoAtual.codigo,
        preco: produtoPesoAtual.preco,
        qtd: peso,
        img: produtoPesoAtual.img
    });

    produtoPesoAtual.estoque -= peso;

    salvar();
    beep();
    atualizar();

    produtoPesoAtual = null;
}