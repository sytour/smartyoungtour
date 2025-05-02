// login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const id = document.getElementById("userId").value;
      const pw = document.getElementById("userPassword").value;

      // 기본 아이디/비밀번호 — 실제 서비스에서는 Firebase Auth 또는 백엔드 연결 필요
      if (id === "user" && pw === "1234") {
        localStorage.setItem("userAuthorized", "true");
        window.location.href = "index.html";
      } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    });
  }

  // 인증되지 않은 사용자는 index.html 접근 차단
  const isIndex = window.location.pathname.includes("index.html");
  if (isIndex && localStorage.getItem("userAuthorized") !== "true") {
    window.location.href = "login.html";
  }
});
