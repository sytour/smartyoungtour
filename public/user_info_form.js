<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
  import {
    getFirestore,
    collection,
    getDocs,
    setDoc,
    doc,
    query,
    where
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  // ✅ Firebase 설정
  const firebaseConfig = {
    apiKey: "AIzaSyDEoEvrhTfLqagtRiBva_pTbswkl5WhACE",
    authDomain: "smartyoungtour.firebaseapp.com",
    projectId: "smartyoungtour",
    storageBucket: "smartyoungtour.appspot.com",
    messagingSenderId: "615207664322",
    appId: "1:615207664322:web:ea2d05effa56e81c43595b",
    measurementId: "G-KN3EQN2WLN"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // ✅ 버튼 클릭 → 저장 + 이동
  window.validateAndProceed = async function () {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const region1 = document.getElementById("region1").value;
    const region2 = document.getElementById("region2").value;
    const kakao = document.getElementById("kakao").value.trim();

    if (!name || !phone || !region1 || !region2) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    const userData = { name, phone, region1, region2, kakao };

    if (document.getElementById("saveInfo").checked) {
      localStorage.setItem("userInfo", JSON.stringify(userData));
      localStorage.setItem("storedClientName", name);
      localStorage.setItem("storedClientPhone", phone);
    }

    await saveUserDataIfNotDuplicate(userData);
    window.location.href = "b2b_country_course_linked.html";
  };

  // ✅ 중복 전화번호 저장 방지
  async function saveUserDataIfNotDuplicate(userData) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phone", "==", userData.phone));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return; // 동일한 전화번호 존재 → 저장 안 함
    }

    const newDocRef = doc(usersRef);
    await setDoc(newDocRef, userData);
  }

  // ✅ 지역 선택시 시/군/구 옵션 동기화
  window.updateSubRegion = function () {
    const region1 = document.getElementById("region1").value;
    const region2 = document.getElementById("region2");
    region2.innerHTML = '<option value="">-- 시/군/구 선택 --</option>';

    const regionData = {
      "서울특별시": ["강남구", "종로구", "마포구", "송파구"],
      "경기도": ["성남시", "용인시", "수원시", "고양시", "광주시"],
      "부산광역시": ["해운대구", "부산진구", "동래구"],
      "대구광역시": ["수성구", "중구", "달서구"]
    };

    if (regionData[region1]) {
      regionData[region1].forEach(sub => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub;
        region2.appendChild(option);
      });
    }
  };

  // ✅ 저장된 localStorage 불러오기
  window.onload = function () {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      const data = JSON.parse(saved);
      document.getElementById("name").value = data.name;
      document.getElementById("phone").value = data.phone;
      document.getElementById("region1").value = data.region1;
      updateSubRegion();
      setTimeout(() => {
        document.getElementById("region2").value = data.region2;
      }, 100);
      document.getElementById("kakao").value = data.kakao || "";
      document.getElementById("saveInfo").checked = true;
    }
  };
</script>
