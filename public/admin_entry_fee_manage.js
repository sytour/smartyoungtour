let coursesData = {}; // { "라오스_비엔티안 골프": [{name: "Pha That Luang", fee: 5}, ...] }

window.onload = async function() {
  await loadCourses();
  renderCourseList();
};

async function loadCourses() {
  const snapshot = await getDocs(collection(db, 'courses'));
  const countrySelect = document.getElementById("countrySelect");
  const courseSelect = document.getElementById("courseSelect");
  countrySelect.innerHTML = "";
  courseSelect.innerHTML = "";

  const countries = new Set();
  const courses = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    countries.add(data.country);
    courses.push({ country: data.country, course: data.course });
  });

  [...countries].sort().forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.innerText = c;
    countrySelect.appendChild(option);
  });

  countrySelect.onchange = () => {
    courseSelect.innerHTML = "";
    const selected = countrySelect.value;
    courses.filter(c => c.country === selected).sort((a,b)=>a.course.localeCompare(b.course)).forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.course;
      opt.innerText = item.course;
      courseSelect.appendChild(opt);
    });
  };

  countrySelect.dispatchEvent(new Event("change"));
}

function addCourse() {
  const country = document.getElementById("countrySelect").value;
  const course = document.getElementById("courseSelect").value;
  const key = `${country}_${course}`;
  if (coursesData[key]) return;

  coursesData[key] = []; // 빈 관광지 목록으로 시작
  renderCourseList();
}

function renderCourseList() {
  const container = document.getElementById("courseListContainer");
  container.innerHTML = "";

  Object.keys(coursesData).sort().forEach(key => {
    const [country, course] = key.split("_");
    const list = document.createElement("div");
    list.innerHTML = `<h3>${country} - ${course}</h3>`;

    const addRowBtn = `<button onclick='addAttraction("${key}")'>관광지 추가</button>`;

    const table = document.createElement("table");
    const header = document.createElement("tr");
    header.innerHTML = `<th>관광지 이름</th><th>입장료 (USD)</th><th>수정</th><th>삭제</th>`;
    table.appendChild(header);

    let total = 0;
    coursesData[key].forEach((attraction, idx) => {
      total += attraction.fee;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type='text' value='${attraction.name}' onchange='updateAttractionName("${key}", ${idx}, this.value)'/></td>
        <td><input type='number' value='${attraction.fee}' onchange='updateAttractionFee("${key}", ${idx}, this.value)'/></td>
        <td><button onclick='updateAttraction("${key}", ${idx})'>수정</button></td>
        <td><button onclick='deleteAttraction("${key}", ${idx})'>삭제</button></td>
      `;
      table.appendChild(row);
    });

    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `<td colspan='4'><strong>총 입장료: ${total.toFixed(2)} USD</strong></td>`;
    table.appendChild(totalRow);

    list.appendChild(table);
    list.innerHTML += addRowBtn;
    container.appendChild(list);
  });
}

function addAttraction(key) {
  coursesData[key].push({ name: "", fee: 0 });
  renderCourseList();
}
function updateAttractionName(key, idx, value) {
  coursesData[key][idx].name = value;
}
function updateAttractionFee(key, idx, value) {
  coursesData[key][idx].fee = parseFloat(value);
}
function updateAttraction(key, idx) {
  renderCourseList();
}
function deleteAttraction(key, idx) {
  coursesData[key].splice(idx, 1);
  renderCourseList();
}
