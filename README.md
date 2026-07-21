# JJ Links v2

Página bio pessoal de **jjxvnz**, publicada em [jjxvnz.bio](https://www.jjxvnz.bio).

Site estático em HTML, CSS e JavaScript, hospedado na Vercel, com vídeo de fundo via YouTube, integrações em tempo real e contador público de acessos.

## O que mudou na v2

- Fundo em vídeo do YouTube (sem camada preta por cima)
- Card com glass mais legível sobre o vídeo
- Removido o MP4 local de fundo (~38 MB)

## Estrutura

| Parte | Descrição |
|-------|-----------|
| `index.html` | Interface e toda a lógica do front-end |
| `public/` | Áudios da playlist e `guild-invites.json` |
| `api/views.js` | Contador de visitas |
| `api/guild.js` | Dados de servidores Discord para o tooltip |
| `vercel.json` | Configuração de cache e deploy na Vercel |

## Licença

Código e arquivos do repositório protegidos por direitos autorais. Detalhes em [LICENSE](LICENSE).
