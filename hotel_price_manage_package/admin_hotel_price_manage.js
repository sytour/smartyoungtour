<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>호텔 요금 관리</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #fdfcf9;
      padding: 40px;
      line-height: 1.6;
    }
    h2 {
      text-align: center;
      margin-bottom: 30px;
    }
    .form-container, .list-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      max-width: 1000px;
      margin: 0 auto 30px auto;
    }
    input, select {
      padding: 8px;
      margin: 6px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }
    button {
      padding: 8px 16px;
      background-color: #ff944d;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin: 6px;
    }
    button:hover {
      background-color: #e67e22;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: center;
    }
    th {
      background-color: #f4f4f4;
    }
  </style>
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyDEoEvrhTfLaqtqR1Bva_pIbskWl5Ah0CE",
      authDomain: "smartyoungtour.firebaseapp.com",
      projectId: "smartyoungtour",
      storageBucket: "smartyoungtour.firebasestorage.app",
      messagingSenderId: "615207664322",
      appId: "1:615207664322:web:ea2d05fefa56e81c43595b",
      measurementId: "G-KN3EQNZWLN"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    async function populateCourseOptions() {
      const coursesSnap = await getDocs(collection(db, "courses"));
      const courseSet = new Set();
      coursesSnap.forEach(docSnap => {
        const data = docSnap.data();
        const option = `${data.country} - ${data.course}`;
        courseSet.add(option);
      });
      const datalist = document.getElementById("courseOptions");
      datalist.innerHTML = "";
      courseSet.forEach(option => {
        const el = document.createElement("option");
        el.value = option;
        datalist.appendChild(el);
      });
    }

    async function renderTable() {
      const tableBody = document.getElementById('hotelTable').querySelector('tbody');
      tableBody.innerHTML = "";
      const snapshot = await getDocs(collection(db, "hotel_prices"));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const row = `
          <tr>
            <td>${data.country}</td>
            <td>${data.course}</td>
            <td>${data.grade}</td>
            <td>${data.single}</td>
            <td>${data.twin_double}</td>
            <td>${data.triple}</td>
            <td>
              <button onclick="editHotel('${docSnap.id}', '${data.country}', '${data.course}', '${data.grade}', '${data.single}', '${data.twin_double}', '${data.triple}')">수정</button>
              <button onclick="deleteHotel('${docSnap.id}')">삭제</button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    }

    window.addHotel = async function() {
      const [country, course] = document.getElementById('course').value.split(" - ");
      const grade = document.getElementById('grade').value;
      const single = parseInt(document.getElementById('single').value) || 0;
      const twin_double = parseInt(document.getElementById('twin_double').value) || 0;
      const triple = parseInt(document.getElementById('triple').value) || 0;

      if (!country || !course) {
        alert('국가명과 코스명을 모두 입력하세요.');
        return;
      }

      await addDoc(collection(db, "hotel_prices"), {
        country, course, grade, single, twin_double, triple
      });

      alert('추가 완료');
      renderTable();
    }

    window.editHotel = async function(id, oldCountry, oldCourse, oldGrade, oldSingle, oldTwinDouble, oldTriple) {
      const newCourseFull = prompt("국가명 - 코스명", `${oldCountry} - ${oldCourse}`);
      const [newCountry, newCourse] = newCourseFull.split(" - ");
      const newGrade = prompt("호텔 등급 (4성급/5성급)", oldGrade);
      const newSingle = prompt("싱글 금액", oldSingle);
      const newTwinDouble = prompt("트윈/더블 금액", oldTwinDouble);
      const newTriple = prompt("트리플 금액", oldTriple);

      if (newCountry && newCourse && newGrade) {
        const ref = doc(db, "hotel_prices", id);
        await updateDoc(ref, {
          country: newCountry,
          course: newCourse,
          grade: newGrade,
          single: parseInt(newSingle) || 0,
          twin_double: parseInt(newTwinDouble) || 0,
          triple: parseInt(newTriple) || 0
        });
        alert('수정 완료');
        renderTable();
      }
    }

    window.deleteHotel = async function(id) {
      if (confirm('정말 삭제하시겠습니까?')) {
        await deleteDoc(doc(db, "hotel_prices", id));
        alert('삭제 완료');
        renderTable();
      }
    }

    window.onload = async function() {
      await populateCourseOptions();
      await renderTable();
    }
  </script>
</head>
<body>
<h2>호텔 요금 관리</h2>
<div class="form-container">
  <input list="courseOptions" id="course" placeholder="국가명 - 코스명">
  <datalist id="courseOptions"></datalist>
  <select id="grade">
    <option value="4성급">4성급</option>
    <option value="5성급">5성급</option>
  </select>
  <input type="number" id="single" placeholder="싱글 요금">
  <input type="number" id="twin_double" placeholder="트윈/더블 요금">
  <input type="number" id="triple" placeholder="트리플 요금">
  <button id="addBtn" onclick="addHotel()">추가</button>
</div>
<div class="list-container">
  <table id="hotelTable">
    <thead>
      <tr>
        <th>국가명</th>
        <th>코스명</th>
        <th>호텔 등급</th>
        <th>싱글</th>
        <th>트윈/더블</th>
        <th>트리플</th>
        <th>관리</th>
      </tr>
    </thead>
    <tbody>
      <!-- 데이터 표시 -->
    </tbody>
  </table>
</div>
</body>
</html>
