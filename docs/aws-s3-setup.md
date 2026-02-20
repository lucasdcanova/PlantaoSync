# 🏥 Configuração do Amazon S3 para o CONFIRMA PLANTÃO

## Objetivo
Configurar um bucket S3 na AWS região **sa-east-1 (São Paulo)** para armazenamento de arquivos
(avatares, logos, relatórios, documentos) com conformidade **LGPD** (Lei Geral de Proteção de Dados).

---

## 1. Criar o Bucket S3

### Passo 1.1 — Acessar o console do S3
1. Acesse [AWS Console → S3](https://s3.console.aws.amazon.com/)
2. Clique em **"Create bucket"**

### Passo 1.2 — Configurações do Bucket
| Campo | Valor |
|-------|-------|
| **Bucket name** | `plantaosync-storage` |
| **AWS Region** | `sa-east-1` (South America - São Paulo) ⚠️ **OBRIGATÓRIO para LGPD** |
| **Object Ownership** | ACLs disabled (recommended) |
| **Block Public Access** | ✅ **Block ALL public access** (marcar todas as 4 opções) |
| **Bucket Versioning** | Enable (recomendado para auditoria LGPD) |
| **Default encryption** | Server-side encryption with Amazon S3 managed keys (SSE-S3) — AES-256 |
| **Bucket key** | Enable |

3. Clique em **"Create bucket"**

---

## 2. Configurar a Política do Bucket (Bucket Policy)

### Passo 2.1 — Acessar a política do bucket
1. Vá em **S3 → plantaosync-storage → Permissions → Bucket policy**
2. Cole a seguinte política:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::plantaosync-storage/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    },
    {
      "Sid": "DenyHTTP",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::plantaosync-storage",
        "arn:aws:s3:::plantaosync-storage/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

> Esta política garante:
> - ❌ Upload sem criptografia é **negado**
> - ❌ Acesso via HTTP (sem SSL) é **negado**

---

## 3. Configurar CORS (Cross-Origin Resource Sharing)

### Passo 3.1
1. Vá em **S3 → plantaosync-storage → Permissions → Cross-origin resource sharing (CORS)**
2. Cole a seguinte configuração:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "https://plantaosync.onrender.com",
      "http://localhost:3002",
      "http://localhost:3001"
    ],
    "ExposeHeaders": ["ETag", "x-amz-request-id"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 4. Criar o Lifecycle Rule (Limpeza automática)

### Passo 4.1
1. Vá em **S3 → plantaosync-storage → Management → Lifecycle rules**
2. Clique em **"Create lifecycle rule"**

| Campo | Valor |
|-------|-------|
| **Rule name** | `cleanup-temp-files` |
| **Prefix filter** | `temp/` |
| **Rule actions** | ✅ Expire current versions of objects |
| **Days after creation** | `7` |

3. Crie outra rule:

| Campo | Valor |
|-------|-------|
| **Rule name** | `cleanup-old-exports` |
| **Prefix filter** | `exports/` |
| **Rule actions** | ✅ Expire current versions of objects |
| **Days after creation** | `90` |

---

## 5. Criar o Usuário IAM (credenciais para a aplicação)

### Passo 5.1 — Criar o usuário
1. Acesse [AWS Console → IAM → Users](https://console.aws.amazon.com/iam/home#/users)
2. Clique em **"Create user"**
3. **User name**: `plantaosync-s3-app`
4. Clique em **Next**

### Passo 5.2 — Criar a política personalizada
1. Escolha **"Attach policies directly"**
2. Clique em **"Create policy"**
3. Selecione a aba **JSON** e cole:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowBucketOperations",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::plantaosync-storage"
    },
    {
      "Sid": "AllowObjectOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::plantaosync-storage/*"
    }
  ]
}
```

4. **Policy name**: `PlantaoSync-S3-Access`
5. **Description**: `Permite acesso ao bucket plantaosync-storage para a aplicação PlantaoSync`
6. Clique em **"Create policy"**

### Passo 5.3 — Anexar a política ao usuário
1. Volte à criação do usuário
2. Pesquise e selecione `PlantaoSync-S3-Access`
3. Clique em **Next → Create user**

### Passo 5.4 — Gerar credenciais (Access Key)
1. Clique no usuário `plantaosync-s3-app`
2. Vá em **Security credentials → Access keys → Create access key**
3. Selecione **"Application running outside AWS"**
4. Clique em **Create access key**
5. ⚠️ **COPIE E SALVE** o `Access Key ID` e `Secret Access Key`

> Esses valores serão usados como variáveis de ambiente na aplicação.

---

## 6. Configurar as Variáveis de Ambiente

### Passo 6.1 — No arquivo `.env` local (desenvolvimento)

```env
AWS_ACCESS_KEY_ID=<seu Access Key ID>
AWS_SECRET_ACCESS_KEY=<seu Secret Access Key>
AWS_S3_REGION=sa-east-1
AWS_S3_BUCKET=plantaosync-storage
AWS_S3_PUBLIC_URL=
```

### Passo 6.2 — No Render (produção)
1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Vá em **plantaosync → Environment**
3. Adicione estas variáveis:

| Key | Value |
|-----|-------|
| `AWS_ACCESS_KEY_ID` | `<seu Access Key ID>` |
| `AWS_SECRET_ACCESS_KEY` | `<seu Secret Access Key>` |
| `AWS_S3_REGION` | `sa-east-1` |
| `AWS_S3_BUCKET` | `plantaosync-storage` |

---

## 7. Estrutura de Pastas no Bucket

O serviço organiza os arquivos nos seguintes prefixos (pastas):

```
plantaosync-storage/
├── avatars/           # Fotos de perfil dos usuários
│   └── {userId}.jpg
├── org-logos/          # Logos das organizações/hospitais
│   └── {orgId}.png
├── reports/            # Relatórios gerados (PDF, Excel)
│   └── {orgId}/{timestamp}-relatorio.pdf
├── documents/          # Documentos enviados
│   └── {orgId}/{userId}/{timestamp}-arquivo.pdf
├── exports/            # Exportações temporárias (auto-expiram em 90 dias)
│   └── {orgId}/{exportId}.xlsx
└── temp/               # Arquivos temporários (auto-expiram em 7 dias)
    └── {uuid}.tmp
```

---

## 8. Conformidade LGPD — Checklist

| Requisito LGPD | Implementação |
|----------------|---------------|
| **Dados armazenados no Brasil** | ✅ Região `sa-east-1` (São Paulo) |
| **Criptografia em repouso** | ✅ AES-256 (SSE-S3), policy proíbe uploads sem criptografia |
| **Criptografia em trânsito** | ✅ Apenas HTTPS (policy proíbe HTTP) |
| **Acesso público bloqueado** | ✅ Block All Public Access habilitado |
| **Acesso mínimo (least privilege)** | ✅ IAM policy restrita ao bucket específico |
| **URLs com tempo limitado** | ✅ Pre-signed URLs expiram em 1h |
| **Direito ao esquecimento** | ✅ Endpoint `DELETE /uploads/lgpd/user/:userId` |
| **Auditoria** | ✅ Bucket Versioning habilitado |
| **Limpeza automática** | ✅ Lifecycle rules para temp (7d) e exports (90d) |

---

## 9. Endpoints da API de Upload

Após a configuração, os seguintes endpoints estarão disponíveis:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/uploads/avatar` | Upload de avatar do usuário (max 2MB, JPEG/PNG/WebP) |
| `POST` | `/uploads/org-logo` | Upload de logo da organização (max 2MB, JPEG/PNG/WebP) |
| `POST` | `/uploads/document` | Upload de documento (max 10MB, JPEG/PNG/WebP/PDF/XLSX/CSV) |
| `GET` | `/uploads/presigned?key=...` | URL pré-assinada para download seguro (expira em 1h) |
| `DELETE` | `/uploads/{key}` | Deletar arquivo específico |
| `DELETE` | `/uploads/lgpd/user/{userId}` | LGPD: deletar todos os arquivos de um usuário |
| `GET` | `/uploads/health` | Health check da conexão S3 |

Todos os endpoints requerem autenticação JWT.

---

## 10. Teste de Conexão

Após configurar as credenciais, reinicie a API. No log deve aparecer:

```
✅ S3 connected — bucket "plantaosync-storage" in sa-east-1
```

Se aparecer erro, verifique:
- As credenciais `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão corretas
- O bucket `plantaosync-storage` existe na região `sa-east-1`
- A política IAM `PlantaoSync-S3-Access` está anexada ao usuário
