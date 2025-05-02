function login() {
  const id = document.getElementById('adminId').value;
  const pw = document.getElementById('adminPassword').value;
  if (id === 'admin' && pw === '1234') {
    localStorage.setItem('authorized', 'true');
    window.location.href = 'b2b_country_course_linked.html';
  } else {
    alert('로그인 실패');
  }
}
