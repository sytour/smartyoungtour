// login.js

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector("button");

  loginButton.addEventListener("click", () => {
    const id = document.getElementById("adminId").value;
    const pw = document.getElementById("adminPassword").value;

    // 임시 로그인 정보 (추후 Firebase 등으로 대체 가능)
    const VALID_ID = "admin";
    const VALID_PW = "1234";

    if (id === VALID_ID && pw === VALID_PW) {
      localStorage.setItem("authorized", "true");
      window.location.href = "admin_main.html";
    } else {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
    }
  });
});
