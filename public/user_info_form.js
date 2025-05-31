
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYEovrThfL1qqtR1Bva_pJbswk1l5AhCE",
  authDomain: "smartyoungtour.firebaseapp.com",
  projectId: "smartyoungtour",
  storageBucket: "smartyoungtour.appspot.com",
  messagingSenderId: "615207664322",
  appId: "1:615207664322:web:ea20d5effa56e01c43595b",
  measurementId: "G-KNSJQNW2WLN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

  try {
    await addDoc(collection(db, "customers"), {
      name,
      phone,
      region1,
      region2,
      kakao,
      timestamp: new Date()
    });

    if (document.getElementById("saveInfo").checked) {
      const userData = { name, phone, region1, region2, kakao };
      localStorage.setItem("userInfo", JSON.stringify(userData));
    }

    window.location.href = "b2b_country_course_linked.html";
  } catch (e) {
    console.error("Firestore 저장 실패:", e);
    alert("저장 중 오류가 발생했습니다.");
  }
};

window.updateSubRegion = function () {
  const regionData = {
    "서울특별시": ["강남구", "종로구", "마포구", "송파구"],
    "경기도": ["성남시", "용인시", "수원시", "고양시", "광주시"],
    "부산광역시": ["해운대구", "부산진구", "동래구"],
    "대구광역시": ["수성구", "중구", "달서구"]
  };

  const region1 = document.getElementById("region1").value;
  const region2 = document.getElementById("region2");
  region2.innerHTML = '<option value="">-- 시/군/구 선택 --</option>';
  if (regionData[region1]) {
    regionData[region1].forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      region2.appendChild(option);
    });
  }
};

window.onload = () => {
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
