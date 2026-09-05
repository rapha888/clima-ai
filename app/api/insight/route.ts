export async function POST(request: Request) {
    try {
      const dados = await request.json();
  
      const prompt = `
  Você é um assistente especialista em clima.
  
  Analise os dados abaixo e gere um resumo curto, claro e útil em português do Brasil.
  
  Cidade: ${dados.cidade}
  
  Clima atual:
  Temperatura: ${dados.temperatura}°C
  Sensação térmica: ${dados.sensacao}°C
  Umidade: ${dados.umidade}%
  Vento: ${dados.vento} km/h
  
  Previsão dos próximos dias:
  ${JSON.stringify(dados.previsao)}
  
  Gere no máximo 3 frases.
  Destaque chuva, mudanças de temperatura e recomendações práticas.
  Não invente dados.
  `;
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );
  
      if (!response.ok) {
        const erroGemini = await response.text();
        console.error("ERRO DO GEMINI:", response.status, erroGemini);
        throw new Error("Erro ao consultar o Gemini");
      }
  
      const data = await response.json();
  
      const insight =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Não foi possível gerar a análise.";
  
      return Response.json({ insight });
    } catch (error) {
        console.error("ERRO DA ROTA:", error);
      return Response.json(
        { error: "Erro ao gerar análise com IA." },
        { status: 500 }
      );
    }
  }