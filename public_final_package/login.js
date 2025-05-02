function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "1234") {
    window.location.href = "b2b_estimate_with_course.html";
  } else {
    alert("아이디 또는 비밀번호가 틀렸습니다.");
  }
}