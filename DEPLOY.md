# Deploy na Vercel

## Passo a Passo

### 1. Instale a Vercel CLI (se não tiver)
```bash
npm install -g vercel
```

### 2. Faça login na Vercel
```bash
vercel login
```

### 3. Configure as variáveis de ambiente na Vercel

Vá para o dashboard da Vercel (https://vercel.com) após o deploy e adicione estas variáveis:

```
DATABASE_URL=postgresql://neondb_owner:npg_cHK0R9uWExyq@ep-square-bonus-acyz06w8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=lauraguillarducciferreira@gmail.com
SMTP_PASS=llvo ptkf pxyq yrrv
PORT=3001
NODE_ENV=production
```

### 4. Deploy
```bash
vercel
```

### 5. Deploy de produção
```bash
vercel --prod
```

## Configuração Automática

O projeto já está configurado com:
- ✅ vercel.json para roteamento
- ✅ Scripts de build configurados
- ✅ API URL dinâmica (desenvolvimento/produção)
- ✅ Prisma migrations automáticas

## Após o Deploy

1. Acesse o painel da Vercel
2. Vá em Settings > Environment Variables
3. Adicione todas as variáveis listadas acima
4. Faça redeploy se necessário

Seu app estará disponível em: `https://seu-projeto.vercel.app`
