# JJ Links

Página bio pessoal de **jjxvnz**, publicada em [jjxvnz.bio](https://www.jjxvnz.bio).

Site estático em HTML, CSS e JavaScript, hospedado na Vercel, com funções serverless para contagem de visitas e integrações em tempo real.

## O que é

Um link-in-bio com visual escuro, efeitos de glassmorphism e tilt 3D, pensado para reunir perfil, redes e mídia em uma única página.

## O que faz

- Exibe perfil e presença do Discord em tempo real (Lanyard)
- Player de música com playlist aleatória, reverb/eco e equalizer (Web Audio API)
- Contador público de visitas, atualizado a cada acesso
- Notificação de novas visitas no Discord via webhook
- Vídeo de fundo, cursor customizado, partículas e layout responsivo

## Estrutura

| Parte | Descrição |
|-------|-----------|
| `index.html` | Interface e toda a lógica do front-end |
| `public/` | Áudios da playlist e vídeo de fundo |
| `api/views.js` | Contador de visitas |
| `api/visit.js` | Registro de visitas no Discord |
| `vercel.json` | Configuração de cache e deploy na Vercel |

## Licença

Código e arquivos do repositório protegidos por direitos autorais. Detalhes em [LICENSE](LICENSE).
