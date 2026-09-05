"use client";

import { useState } from "react";

export default function Home() {
  const [cidade, setCidade] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [insightIA, setInsightIA] = useState("");
  const [carregandoIA, setCarregandoIA] = useState(false);
  function interpretarClima(codigo: number) {
    if (codigo === 0) return { icone: "☀️", texto: "Céu limpo" };
    if ([1, 2].includes(codigo)) return { icone: "🌤️", texto: "Parcialmente nublado" };
    if (codigo === 3) return { icone: "☁️", texto: "Nublado" };
    if ([45, 48].includes(codigo)) return { icone: "🌫️", texto: "Neblina" };
    if ([51, 53, 55, 56, 57].includes(codigo)) return { icone: "🌦️", texto: "Garoa" };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo))
      return { icone: "🌧️", texto: "Chuva" };
    if ([71, 73, 75, 77, 85, 86].includes(codigo))
      return { icone: "❄️", texto: "Neve" };
    if ([95, 96, 99].includes(codigo))
      return { icone: "⛈️", texto: "Tempestade" };
  
    return { icone: "🌡️", texto: "Condição variável" };
  }
  function encontrarMelhorDia(previsao: any[]) {
    if (!previsao || previsao.length === 0) return null;
  
    const melhorDia = [...previsao].sort((a, b) => {
      if (a.chuva !== b.chuva) {
        return a.chuva - b.chuva;
      }
  
      return b.maxima - a.maxima;
    })[0];
  
    return melhorDia;
  }
  
  function gerarInsightSemana(previsao: any[]) {
    if (!previsao || previsao.length === 0) return "";
  
    const maiorChuva = Math.max(...previsao.map((dia) => dia.chuva));
    const maiorMaxima = Math.max(...previsao.map((dia) => dia.maxima));
    const menorMinima = Math.min(...previsao.map((dia) => dia.minima));
  
    const diasChuvosos = previsao.filter((dia) => dia.chuva >= 70).length;
  
    let insight = "";
  
    if (diasChuvosos >= 2) {
      insight += `A semana apresenta tendência de chuva, com ${diasChuvosos} dos próximos 5 dias registrando alta probabilidade de precipitação. `;
    } else if (maiorChuva >= 70) {
      insight += `Há possibilidade elevada de chuva em pelo menos um dos próximos dias. `;
    } else {
      insight += `A previsão indica baixa ocorrência de chuva nos próximos dias. `;
    }
  
    insight += `As temperaturas devem variar entre ${menorMinima}°C e ${maiorMaxima}°C. `;
  
    if (maiorMaxima - menorMinima >= 10) {
      insight +=
        "A variação de temperatura será significativa, então vale atenção às mudanças ao longo da semana.";
    } else {
      insight +=
        "As temperaturas devem permanecer relativamente estáveis durante o período.";
    }
  
    return insight;
  }
  
  

  async function buscarClima() {
    if (!cidade.trim()) {
      setErro("Digite uma cidade.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      setResultado(null);
      setInsightIA("");

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cidade
        )}&count=1&language=pt&format=json`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setErro("Cidade não encontrada.");
        return;
      }

      const local = geoData.results[0];

      const climaResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto`
      );

      const climaData = await climaResponse.json();
      const previsao = climaData.daily.time.map((data: string, index: number) => ({
        data,
        maxima: climaData.daily.temperature_2m_max[index],
        minima: climaData.daily.temperature_2m_min[index],
        chuva: climaData.daily.precipitation_probability_max[index],
        codigo: climaData.daily.weather_code[index],
      })).slice(0, 5);
      const melhorDia = encontrarMelhorDia(previsao);

      setResultado({
        cidade: local.name,
        estado: local.admin1,
        pais: local.country,
        temperatura: climaData.current.temperature_2m,
        sensacao: climaData.current.apparent_temperature,
        umidade: climaData.current.relative_humidity_2m,
        vento: climaData.current.wind_speed_10m,
      
        previsao,
        melhorDia,
        insightSemana: gerarInsightSemana(previsao),
      });
      setCarregandoIA(true);
      const respostaIA = await fetch("/api/insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cidade: local.name,
          temperatura: climaData.current.temperature_2m,
          sensacao: climaData.current.apparent_temperature,
          umidade: climaData.current.relative_humidity_2m,
          vento: climaData.current.wind_speed_10m,
          previsao,
        }),
      });
      
      const dadosIA = await respostaIA.json();
      
      if (respostaIA.ok) {
        setInsightIA(dadosIA.insight);
      } else {
        setInsightIA("A análise da IA está temporariamente indisponível. Tente novamente em alguns instantes.");
      }
    } catch {
      setErro("Não foi possível consultar o clima.");
    } finally {
      setCarregando(false);
      setCarregandoIA(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-4xl">
  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">
    Inteligência climática com IA
  </p>

  <h1 className="text-5xl font-bold tracking-tight">
    Clima<span className="text-sky-400">AI</span>
  </h1>

  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
    Consulte o clima de qualquer cidade, acompanhe os próximos dias e receba
    análises inteligentes geradas com inteligência artificial.
  </p>

  <div className="mt-8 flex max-w-2xl gap-3">
    <input
      type="text"
      value={cidade}
      onChange={(e) => setCidade(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") buscarClima();
      }}
      placeholder="Digite uma cidade..."
      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-white outline-none transition focus:border-sky-500"
    />

    <button
      onClick={buscarClima}
      className="rounded-xl bg-sky-500 px-7 py-4 font-semibold text-white transition hover:bg-sky-400"
    >
      {carregando ? "Buscando..." : "Analisar"}
    </button>
  </div>
</div>

        {erro && <p className="mt-4 text-red-400">{erro}</p>}

        {resultado && (
          <div className="mt-10 max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-sky-400">CLIMA ATUAL</p>

            <h2 className="mt-2 text-2xl font-bold">
              {resultado.cidade}
              {resultado.estado ? `, ${resultado.estado}` : ""}
            </h2>

            <p className="text-slate-400">{resultado.pais}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-slate-400">Temperatura</p>
                <p className="text-2xl font-bold">{resultado.temperatura}°C</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Sensação</p>
                <p className="text-2xl font-bold">{resultado.sensacao}°C</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Umidade</p>
                <p className="text-2xl font-bold">{resultado.umidade}%</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Vento</p>
                <p className="text-2xl font-bold">{resultado.vento} km/h</p>
              </div>
            </div> <div className="mt-6 rounded-xl border border-sky-900 bg-sky-950/40 p-5">
  <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">
    Análise inteligente
  </p>

  <p className="mt-3 text-slate-200">
    {resultado.temperatura >= 30
      ? "A temperatura está elevada. Evite atividades intensas nos horários mais quentes e mantenha-se hidratado."
      : resultado.temperatura <= 15
      ? "A temperatura está baixa. Considere roupas mais quentes e atenção maior em atividades ao ar livre."
      : resultado.umidade >= 70
      ? "A umidade está alta. A sensação térmica pode parecer mais intensa e o ambiente tende a ficar mais abafado."
      : resultado.vento >= 30
      ? "Os ventos estão fortes. Atividades externas podem exigir mais atenção."
      : "As condições climáticas estão relativamente confortáveis para atividades do dia a dia."}
  </p>
</div><div className="mt-6">
  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-400">
    Próximos 5 dias
  </p>

  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
    {resultado.previsao.map((dia: any, index: number) => (
      <div
        key={dia.data}
        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:-translate-y-1 hover:border-sky-500/40 hover:bg-slate-900/80"
      >
        <p className="text-sm font-semibold text-white">
          {index === 0
            ? "Hoje"
            : new Date(`${dia.data}T12:00:00`).toLocaleDateString("pt-BR", {
                weekday: "short",
              })}
        </p>
        <div className="mt-3">
  <div className="text-2xl">
    {interpretarClima(dia.codigo).icone}
  </div>

  <p className="mt-1 text-xs text-slate-400">
    {interpretarClima(dia.codigo).texto}
  </p>
</div>

        <p className="mt-3 text-lg font-bold">
          {dia.maxima}°
        </p>

        <p className="text-sm text-slate-400">
          Mín. {dia.minima}°
        </p>

        <p className="mt-2 text-sm text-sky-400">
          Chuva: {dia.chuva}%
        </p>
      </div>
 ))}
  </div>
  {carregandoIA && (
    <div className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950/30 p-5">
      <p className="animate-pulse text-sm font-semibold text-emerald-400">
        ✨ IA analisando os dados climáticos...
      </p>
    </div>
)}
 {insightIA && (      
      <div className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950/30 p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
          ✨ Análise da IA
        </p>
    
        <p className="mt-3 leading-relaxed text-slate-200">
          {insightIA}
        </p>
      </div>
    )}
    {resultado.melhorDia && (
  <div className="mt-6 rounded-xl border border-amber-900 bg-amber-950/30 p-5">
    <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
      ☀️ Melhor dia da semana
    </p>

    <p className="mt-3 leading-relaxed text-slate-200">
      {new Date(`${resultado.melhorDia.data}T12:00:00`).toLocaleDateString(
        "pt-BR",
        {
          weekday: "long",
        }
      )}{" "}
      — máxima de {resultado.melhorDia.maxima}°C e{" "}
      {resultado.melhorDia.chuva}% de chance de chuva.
    </p>
  </div>
)}
   
 <div className="mt-6 rounded-xl border border-violet-900 bg-violet-950/30 p-5">
  <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">
    🧠 Insight da semana
  </p>

  <p className="mt-3 leading-relaxed text-slate-200">
    {resultado.insightSemana}
  </p>
</div>

</div>
          </div>
        )}
      </div>
    </main>
  );
}