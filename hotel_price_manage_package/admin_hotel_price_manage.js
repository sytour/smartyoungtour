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
  <script type="module" src="./admin_hotel_price_manage.js"></script>
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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

    let allCourses = [];

    window.addEventListener('DOMContentLoaded', async () => {
      const countrySelect = document.getElementById("country");
      const courseInput = document.getElementById("course");

      const snapshot = await getDocs(collection(db, "courses"));
      const countries = new Set();
      allCourses = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.country && data.course) {
          countries.add(data.country);
          allCourses.push(data);
        }
      });

      countrySelect.innerHTML = "<option value=''>국가 선택</option>";
      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
      });

      countrySelect.addEventListener("change", () => {
        const selectedCountry = countrySelect.value;
        const matchedCourses = allCourses.filter(c => c.country === selectedCountry);
        if (matchedCourses.length === 1) {
          courseInput.value = matchedCourses[0].course;
        } else {
          courseInput.value = "";
        }
      });
    });
  </script>
</head>
<body>
<h2>호텔 요금 관리</h2>
<div class="form-container">
  <select id="country">
    <option value="">국가 선택</option>
  </select>
  <input type="text" id="course" placeholder="코스명 (예: 방비엥 일반)">
  <select id="grade">
    <option value="4성급">4성급</option>
    <option value="5성급">5성급</option>
  </select>
  <input type="number" id="single" placeholder="싱글 요금">
  <input type="number" id="twin_double" placeholder="트윈/더블 요금">
  <input type="number" id="triple" placeholder="트리플 요금">
  <button id="addBtn">추가</button>
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
