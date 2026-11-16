const habilidades = [
  {
    id: 1,
    nome: "Fogo da memória",
    custo: 30,
    efeito: "Os rastros do passado iluminam o caminho.",
  },
  {
    id: 2,
    nome: "Manto de brasas",
    custo: 40,
    efeito: "Um escudo de fogo frio protege seus aliados.",
  },
  {
    id: 3,
    nome: "Passo de cinza",
    custo: 20,
    efeito: "Nero atravessa a distância em uma nuvem de cinzas.",
  },
];
let mana = 100;
let categoriaAtual = "todos";

const cabecalho = document.querySelector(".cabecalho");
const links = document.querySelectorAll(".menu a");
const secoes = Array.from(links).map((link) => document.querySelector(link.hash));
const barras = document.querySelectorAll(".preenchimento");
const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

function medirCabecalho() {
  document.documentElement.style.setProperty(
    "--altura-cabecalho",
    `${cabecalho.offsetHeight}px`,
  );
}
function atualizarNavegacao() {
  let atual = secoes[0];
  secoes.forEach((secao) => {
    if (secao.getBoundingClientRect().top <= cabecalho.offsetHeight + 50) atual = secao;
  });
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    atual = secoes[secoes.length - 1];
  }
  links.forEach((link) => {
    const ativo = link.hash === `#${atual.id}`;
    link.classList.toggle("ativo", ativo);
    if (ativo) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  cabecalho.classList.toggle("rolado", window.scrollY > 20);
}
medirCabecalho();
if ("ResizeObserver" in window) new ResizeObserver(medirCabecalho).observe(cabecalho);
window.addEventListener("resize", medirCabecalho);
window.addEventListener("scroll", atualizarNavegacao, { passive: true });
atualizarNavegacao();

function animarBarras() {
  if (menosMovimento.matches) return;
  barras.forEach((barra) => {
    barra.getAnimations().forEach((animacao) => animacao.cancel());
    barra.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: 1300,
      easing: "ease-out",
    });
  });
}
if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          animarBarras();
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.25 },
  );
  observador.observe(document.querySelector(".atributos"));
}
menosMovimento.addEventListener("change", () => {
  if (menosMovimento.matches)
    barras.forEach((barra) => barra.getAnimations().forEach((a) => a.cancel()));
});
const repetir = document.createElement("button");
repetir.type = "button";
repetir.className = "controle";
repetir.textContent = "Repetir animação";
repetir.addEventListener("click", animarBarras);
document.querySelector(".atributos").appendChild(repetir);

const painel = document.createElement("div");
painel.className = "painel-interativo";
const titulo = document.createElement("h4");
titulo.textContent = "Experimente a chama";
painel.appendChild(titulo);
const saldo = document.createElement("p");
painel.appendChild(saldo);
const acoes = document.createElement("div");
acoes.className = "controles";
painel.appendChild(acoes);
const mensagem = document.createElement("p");
mensagem.className = "mensagem";
mensagem.setAttribute("role", "status");
mensagem.textContent = "Simulação: escolha uma habilidade para usar mana.";
function atualizarMana() {
  saldo.textContent = `Mana: ${mana} / 100`;
  acoes.querySelectorAll("[data-habilidade]").forEach((botao) => {
    const habilidade = habilidades.find(
      (item) => item.id === Number(botao.dataset.habilidade),
    );
    botao.disabled = mana < habilidade.custo;
  });
}
function usarHabilidade(id) {
  const habilidade = habilidades.find((item) => item.id === id);
  if (!habilidade || mana < habilidade.custo) return;
  mana -= habilidade.custo;
  mensagem.textContent = `${habilidade.nome}: ${habilidade.efeito} Restam ${mana} de mana.`;
  atualizarMana();
}
habilidades.forEach((habilidade) => {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "controle";
  botao.dataset.habilidade = habilidade.id;
  botao.textContent = `${habilidade.nome} (−${habilidade.custo})`;
  botao.addEventListener("click", () => usarHabilidade(habilidade.id));
  acoes.appendChild(botao);
});
const restaurar = document.createElement("button");
restaurar.type = "button";
restaurar.className = "controle";
restaurar.textContent = "Restaurar mana";
restaurar.addEventListener("click", () => {
  mana = 100;
  atualizarMana();
  mensagem.textContent =
    "Mana restaurada. A chama está pronta para uma nova demonstração.";
});
acoes.appendChild(restaurar);
painel.appendChild(mensagem);
document.querySelector(".habilidades").appendChild(painel);
atualizarMana();

const itens = Array.from(document.querySelectorAll(".card-item")).map((elemento) => ({
  elemento,
  nome: elemento.querySelector("h3").textContent,
  categoria: elemento.classList.contains("item-lendario") ? "lendario" : "raro",
}));
const filtros = document.createElement("div");
filtros.className = "controles filtros";
filtros.setAttribute("role", "group");
filtros.setAttribute("aria-label", "Filtrar inventário por raridade");
const categorias = [
  { id: "todos", nome: "Todos" },
  { id: "lendario", nome: "Lendários" },
  { id: "raro", nome: "Raros" },
];
categorias.forEach((categoria) => {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "controle filtro";
  botao.dataset.categoria = categoria.id;
  botao.textContent = categoria.nome;
  filtros.appendChild(botao);
});
const grade = document.querySelector(".grade-inventario");
grade.before(filtros);
const resumo = document.createElement("p");
resumo.className = "resumo-filtro";
resumo.setAttribute("role", "status");
grade.after(resumo);
function renderizarInventario() {
  const visiveis = itens.filter(
    (item) => categoriaAtual === "todos" || item.categoria === categoriaAtual,
  );
  itens.forEach((item) => {
    item.elemento.hidden = !visiveis.includes(item);
  });
  filtros.querySelectorAll("button").forEach((botao) => {
    const ativo = botao.dataset.categoria === categoriaAtual;
    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });
  resumo.textContent = `${visiveis.length} de ${itens.length} relíquias: ${visiveis.map((item) => item.nome).join(", ")}.`;
}
filtros.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".filtro");
  if (!botao) return;
  categoriaAtual = botao.dataset.categoria;
  renderizarInventario();
});
renderizarInventario();
