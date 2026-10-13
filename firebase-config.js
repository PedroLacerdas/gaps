/* Configuração do Firebase deste app.
   Console do Firebase > Configurações do projeto > Seus apps > App da Web > "Configuração do SDK".
   Cole os valores abaixo. Enquanto projectId e apiKey estiverem vazios, o app guarda os relatórios só no navegador. */
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

/* true  = pede e-mail e senha (Authentication > Método de login > E-mail/senha) antes de ler ou salvar relatórios.
   false = sem login; as regras do Firestore precisam liberar a coleção "relatorios" para qualquer pessoa (veja o README). */
window.FIREBASE_EXIGIR_LOGIN = true;
