import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { country, course } = req.body;

    try {
      const filePath = path.join(process.cwd(), 'public', 'b2b_country_course_linked.html');
      let htmlContent = fs.readFileSync(filePath, 'utf8');

      const marker = '<!-- 추가 코스 삽입 위치 -->';
      const newOption = `<option value="\${course}">\${course}</option>\n\${marker}`;

      if (htmlContent.includes(marker)) {
        htmlContent = htmlContent.replace(marker, newOption);
        fs.writeFileSync(filePath, htmlContent, 'utf8');
        return res.status(200).json({ message: '코스가 추가되었습니다.' });
      } else {
        return res.status(500).json({ message: '삽입 위치를 찾을 수 없습니다.' });
      }

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '파일 수정 중 오류 발생' });
    }
  } else {
    res.status(405).json({ message: 'POST 요청만 허용됩니다.' });
  }
}