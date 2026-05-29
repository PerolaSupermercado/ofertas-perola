const SUPABASE_URL = "COLE_AQUI_SUA_SUPABASE_URL";
const SUPABASE_ANON_KEY = "COLE_AQUI_SUA_SUPABASE_ANON_KEY";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const formLogin = document.getElementById("formLogin");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnEntrar = document.getElementById("btnEntrar");
const mensagemLogin = document.getElementById("mensagemLogin");

function mostrarMensagem(texto, tipo) {
  mensagemLogin.textContent = texto;
  mensagemLogin.className = "mensagem-login " + tipo;
}

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  mostrarMensagem("", "");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    mostrarMensagem("E-mail ou senha incorretos. Tente novamente.", "erro");

    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar no painel";

    return;
  }

  mostrarMensagem("Login realizado com sucesso. Redirecionando...", "sucesso");

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 800);
});
