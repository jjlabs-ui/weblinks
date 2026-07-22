# JJ Links v2

Página bio pessoal de **jjxvnz**, publicada em [jjxvnz.bio](https://www.jjxvnz.bio).

Site estático em HTML, CSS e JavaScript, hospedado na Vercel, com vídeo de fundo local, integrações Discord em tempo real e player com efeito de eco/reverb.

## Destaques

- Card glass monocromático com Discord colorido
- Vídeo de fundo otimizado para mobile (entrada rápida no splash)
- Player com **Help I'm Alive** — Metric + reverb/eco de espaço vazio
- Contador de visitas e tooltip de servidor Discord

## Estrutura

| Parte | Descrição |
|-------|-----------|
| `index.html` | Interface e toda a lógica do front-end |
| `public/` | `bg-video.mp4`, faixa MP3 e `guild-invites.json` |
| `api/views.js` | Contador de visitas |
| `api/guild.js` | Dados de servidores Discord para o tooltip |
| `vercel.json` | Cache e rotas de deploy |

## Licença

Código e arquivos do repositório protegidos por direitos autorais. Detalhes em [LICENSE](LICENSE).
