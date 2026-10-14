/* Configuração do Firebase deste app.
   Console do Firebase > Configurações do projeto > Seus apps > App da Web > "Configuração do SDK".
   Cole os valores abaixo. Enquanto projectId e apiKey estiverem vazios, o app guarda os relatórios só no navegador. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDdF3EawecNrob-Hi20gvl7euYovFnzRfc",
  authDomain: "gaps-d19b4.firebaseapp.com",
  projectId: "gaps-d19b4",
  storageBucket: "gaps-d19b4.firebasestorage.app",
  messagingSenderId: "368330551514",
  appId: "1:368330551514:web:463bd871fdeac5d090b5e3"
};

/* true  = pede e-mail e senha (Authentication > Método de login > E-mail/senha) antes de ler ou salvar relatórios.
   false = sem login; as regras do Firestore precisam liberar a coleção "relatorios" para qualquer pessoa (veja o README). */
window.FIREBASE_EXIGIR_LOGIN = true;
