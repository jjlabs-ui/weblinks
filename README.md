# JJ Links — jjxvnz.bio

Site bio pessoal em HTML/CSS/JS, deploy na [Vercel](https://vercel.com).

**URL:** https://www.jjxvnz.bio

## Funcionalidades

- Perfil com presença Discord (Lanyard)
- Player de música com playlist, reverb e equalizer (Web Audio API)
- Contador de visitas (+1 a cada entrada / F5)
- Notificação de visitas no Discord (webhook)
- Design responsivo, vídeo de fundo, efeitos visuais

## Estrutura do projeto

```
├── index.html      # Site (UI + lógica)
├── public/         # Áudios, vídeo e assets estáticos
├── api/
│   ├── views.js    # GET — incrementa e retorna contagem
│   └── visit.js    # POST — notifica visita no Discord
├── vercel.json     # Cache e headers
├── robots.txt
└── sitemap.xml
```

## APIs (Vercel)

| Rota | Método | Função |
|------|--------|--------|
| `/api/views` | GET | Incrementa visitante e devolve `{ count }` |
| `/api/visit` | POST | Envia embed de visita ao Discord |

### Variável de ambiente (Vercel)

- `DISCORD_WEBHOOK_URL` — webhook para alertas de visita (`api/visit.js`)

## Deploy

Push na branch `main` → deploy automático na Vercel.

```bash
git push origin main
```

## Desenvolvimento local

Servir a pasta na raiz (ex.: extensão Live Server ou `npx serve .`).

As rotas `/api/*` só funcionam com `vercel dev` ou após deploy.

## Licença

Consulte [LICENSE](LICENSE).
