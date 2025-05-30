<!-- Firebase JS SDK (CDN 방식) -->
<script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js"></script>
<script>
  const firebaseConfig = {
    apiKey: "AIzaSyDEoEvrhfTLqagtR1bva_P1bsWk1SaH0cE",
    authDomain: "smartyoungtour.firebaseapp.com",
    projectId: "smartyoungtour",
    storageBucket: "smartyoungtour.appspot.com",
    messagingSenderId: "615207664322",
    appId: "1:615207664322:web:ea2d05fefa56e81c43595b",
    measurementId: "G-KN3EQNZWLN"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");

  let courseDataMap = {};

  function updateCountryDropdown() {
    countrySelect.innerHTML = '<option value="">선택</option>';
    Object.keys(courseDataMap).sort().forEach(country => {
      const opt = document.createElement("option");
      opt.value = country;
      opt.textContent = country;
      countrySelect.appendChild(opt);
    });
  }

  function updateCourseDropdown() {
    const selectedCountry = countrySelect.value;
    const courseList = courseDataMap[selectedCountry] || [];
    courseSelect.innerHTML = '<option value="">선택</option>';
    courseList.forEach(course => {
      const opt = document.createElement("option");
      opt.value = course;
      opt.textContent = course;
      courseSelect.appendChild(opt);
    });
  }

  function subscribeToCourseUpdates() {
    db.collection("courses").onSnapshot(snapshot => {
      courseDataMap = {};
      snapshot.forEach(doc => {
        let { country, course } = doc.data();
        if (!country || !course) return;
        country = country.trim(); // ✅ 공백 제거
        course = course.trim();
        if (!courseDataMap[country]) courseDataMap[country] = [];
        if (!courseDataMap[country].includes(course)) {
          courseDataMap[country].push(course);
        }
      });
      updateCountryDropdown();
      updateCourseDropdown();
    });
  }

  countrySelect.addEventListener("change", updateCourseDropdown);

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
    const group = document.getElementById("groupSelect").value;
    const d1 = parseFloat(document.getElementById("discountGroup1").value) || 0;
    const d2 = parseFloat(document.getElementById("discountGroup2").value) || 0;

    if (!country || !course) {
      alert("국가와 코스를 모두 선택하세요.");
      return;
    }

    const key = `${country}_${course}_${option}_${shopping}_${group}`;

    await db.collection("optional_discounts").doc(key).set({
      country,
      course,
      option,
      shopping,
      group,
      discount_1to7: d1,
      discount_8plus: d2,
      total: d1 + d2
    });

    alert("저장되었습니다.");
  };

  subscribeToCourseUpdates();
</script>
