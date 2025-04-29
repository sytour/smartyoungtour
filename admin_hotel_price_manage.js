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
  <script type="module" src="admin_hotel_price_manage.js"></script>
</head>
<body>
<h2>호텔 요금 관리</h2>
<div class="form-container">
  <select id="country">
    <option value="라오스">라오스</option>
    <option value="베트남">베트남</option>
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
