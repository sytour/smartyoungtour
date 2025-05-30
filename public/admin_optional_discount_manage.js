<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>옵션/쇼핑 선택 할인 관리</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #fffdf7;
      padding: 40px;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 0 12px rgba(0,0,0,0.06);
    }
    h2 {
      text-align: center;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: center;
    }
    select, input[type="number"] {
      width: 100%;
      padding: 6px;
      font-size: 14px;
    }
    .save-btn {
      margin-top: 20px;
      padding: 12px 24px;
      font-size: 16px;
      background-color: #ff944d;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .save-btn:hover {
      background-color: #e67e22;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>옵션/쇼핑 선택 할인 관리</h2>
    <table>
      <thead>
        <tr>
          <th>국가</th>
          <th>코스</th>
          <th>옵션</th>
          <th>쇼핑</th>
          <th>1~7명 할인 (USD)</th>
          <th>8명 이상 할인 (USD)</th>
          <th>합계 미리보기</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <select id="countrySelect" onchange="loadCourses()">
              <option value="">선택</option>
            </select>
          </td>
          <td>
            <select id="courseSelect">
              <option value="">선택</option>
            </select>
          </td>
          <td>
            <select id="optionSelect">
              <option value="유">옵션 유</option>
              <option value="무">옵션 무</option>
            </select>
          </td>
          <td>
            <select id="shoppingSelect">
              <option value="노쇼핑">노쇼핑</option>
              <option value="쇼핑1">쇼핑 1회</option>
              <option value="쇼핑2">쇼핑 2회</option>
              <option value="쇼핑3">쇼핑 3회</option>
            </select>
          </td>
          <td><input type="number" id="discountGroup1" value="0" onchange="updatePreview()" /></td>
          <td><input type="number" id="discountGroup2" value="0" onchange="updatePreview()" /></td>
          <td id="previewTotal">0 USD</td>
        </tr>
      </tbody>
    </table>
    <button class="save-btn" onclick="saveDiscount()">저장</button>
  </div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getFirestore, collection, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const countrySelect = document.getElementById("countrySelect");
    const courseSelect = document.getElementById("courseSelect");

    async function loadCountriesAndCourses() {
      const snapshot = await getDocs(collection(db, "courses"));
      const countryMap = {};

      snapshot.forEach(doc => {
        const { country, course } = doc.data();
        if (!countryMap[country]) countryMap[country] = [];
        countryMap[country].push(course);
      });

      countrySelect.innerHTML = '<option value="">선택</option>';
      Object.keys(countryMap).sort().forEach(country => {
        const opt = document.createElement("option");
        opt.value = country;
        opt.textContent = country;
        countrySelect.appendChild(opt);
      });

      countrySelect.dataset.courses = JSON.stringify(countryMap);
    }

    window.loadCourses = () => {
      const selected = countrySelect.value;
      const map = JSON.parse(countrySelect.dataset.courses || '{}');
      const courseList = map[selected] || [];

      courseSelect.innerHTML = '<option value="">선택</option>';
      courseList.forEach(course => {
        const opt = document.createElement("option");
        opt.value = course;
        opt.textContent = course;
        courseSelect.appendChild(opt);
      });
    };

    window.updatePreview = () => {
      const d1 = parseFloat(document.getElementById("discountGroup1").value) || 0;
      const d2 = parseFloat(document.getElementById("discountGroup2").value) || 0;
      document.getElementById("previewTotal").innerText = `${d1 + d2} USD`;
    };

    window.saveDiscount = async () => {
      const country = countrySelect.value;
      const course = courseSelect.value;
      const option = document.getElementById("optionSelect").value;
      const shopping = document.getElementById("shoppingSelect").value;
      const d1 = parseFloat(document.getElementById("discountGroup1").value) || 0;
      const d2 = parseFloat(document.getElementById("discountGroup2").value) || 0;

      if (!country || !course) {
        alert("국가와 코스를 모두 선택하세요.");
        return;
      }

      const key = `${country}_${course}_${option}_${shopping}`;

      await setDoc(doc(db, "optional_discounts", key), {
        country,
        course,
        option,
        shopping,
        discount_1to7: d1,
        discount_8plus: d2,
        total: d1 + d2
      });

      alert("저장되었습니다.");
    };

    loadCountriesAndCourses();
  </script>
</body>
</html>
