import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { course } = req.body;

    try {
      const filePath = path.join(process.cwd(), 'public', 'b2b_country_course_linked.html');
      let htmlContent = fs.readFileSync(filePath, 'utf8');

      const optionRegex = new RegExp(`<option value="\${course}">\${course}</option>\\n?`, 'g');
      htmlContent = htmlContent.replace(optionRegex, '');

      fs.writeFileSync(filePath, htmlContent, 'utf8');
      return res.status(200).json({ message: '코스가 삭제되었습니다.' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '파일 수정 중 오류 발생' });
    }
  } else {
    res.status(405).json({ message: 'POST 요청만 허용됩니다.' });
  }
}