# 🌦️ ClimaAI

Aplicação web de previsão do tempo que combina dados meteorológicos em tempo real com inteligência artificial para gerar análises climáticas simples e úteis.

🔗 **Projeto online:** https://clima-ai-ten.vercel.app/

## ✨ Funcionalidades

- 🔎 Busca de clima por cidade
- 🌡️ Temperatura e sensação térmica
- 💧 Umidade do ar
- 💨 Velocidade do vento
- 📅 Previsão para os próximos 5 dias
- 🌧️ Probabilidade de chuva
- ☀️ Identificação do melhor dia da semana
- 🧠 Insights automáticos sobre a previsão
- ✨ Análise climática gerada com Gemini
- 📱 Interface responsiva para desktop e celular
- ⚠️ Tratamento de erros para cidades não encontradas e falhas da IA

## 🛠️ Tecnologias utilizadas

- Next.js
- TypeScript
- React
- Tailwind CSS
- Open-Meteo API
- Gemini API
- Vercel

## 🤖 Inteligência Artificial

O ClimaAI envia os dados meteorológicos obtidos pela API para uma rota server-side da aplicação.

A integração com o Gemini gera um resumo em português destacando informações relevantes da previsão, como possibilidade de chuva, mudanças de temperatura e recomendações práticas.

A chave da API é armazenada em variável de ambiente e não é exposta no código enviado ao navegador.

## 🌐 APIs

**Open-Meteo**

Utilizada para localização das cidades e obtenção dos dados meteorológicos.

**Gemini**

Utilizada para geração das análises climáticas com inteligência artificial.

## 🚀 Deploy

O projeto está publicado na Vercel.

Acesse:

https://clima-ai-ten.vercel.app/

## 📌 Sobre o projeto

Projeto desenvolvido para portfólio com o objetivo de praticar desenvolvimento web moderno, consumo de APIs, integração com inteligência artificial e criação de interfaces responsivas.