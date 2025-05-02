function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (username === "agent" && password === "1234") {
    window.location.href = "b2b_country_course_linked.html";
  } else {
    alert("아이디 또는 비밀번호가 올바르지 않습니다.");
  }
}