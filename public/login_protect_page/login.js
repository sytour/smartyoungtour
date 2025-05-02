// login.js
export function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "smart" && pass === "1234") {
    window.location.href = "index.html";
  } else {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
}
window.login = login;
