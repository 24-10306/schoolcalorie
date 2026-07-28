export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { image } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const prompt = `이 급식 사진을 분석해서 다음 JSON 형식으로 응답해줘:
  {
    "foodName": "음식 이름들",
    "calories": "총 예상 칼로리",
    "protein": "단백질(g)",
    "carbs": "탄수화물(g)",
    "fat": "지방(g)",
    "healthScore": "100점 만점 건강 점수",
    "comment": "AI 건강 코멘트"
  }`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: image } }
          ]
        }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ analysis: resultText });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze' });
  }
}
