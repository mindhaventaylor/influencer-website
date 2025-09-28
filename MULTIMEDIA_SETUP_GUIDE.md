# 🎵🖼️ Guia de Configuração Multimídia

Este guia explica como configurar o sistema de mensagens multimídia que suporta texto, áudio e imagens.

## 📋 Funcionalidades Implementadas

### ✅ Tipos de Mensagem Suportados:
- **Texto → Texto**: Mensagem de texto normal
- **Texto → Áudio**: IA responde com áudio (a cada 5-8 mensagens aleatórias)
- **Imagem → Texto**: Usuário envia imagem, IA responde com texto
- **Imagem → Áudio**: Usuário envia imagem, IA responde com áudio
- **Áudio → Texto**: Usuário envia áudio, IA responde com texto
- **Áudio → Áudio**: Usuário envia áudio, IA responde com áudio

### 🎯 Lógica de Áudio Automático:
- A IA envia respostas em áudio a cada 5-8 mensagens (número aleatório)
- Configurável via API ou variáveis de ambiente

### 🗄️ Estrutura Simplificada:
- **Sem mudanças no banco**: Usa campos existentes (`content_type`, `media_url`, `metadata`)
- **Compatível**: Funciona com a estrutura atual do banco de dados
- **Flexível**: Armazena informações adicionais no campo `metadata`

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente

Adicione estas variáveis ao seu `.env.local`:

```bash
# Serviço de IA Multimídia
AI_SERVICE_URL=https://your-ai-service.com/api/chat
AI_SERVICE_TOKEN=your_ai_service_token_here

# ElevenLabs para TTS
ELEVENLABS_VOICE_ID=voice_sarah_123
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Configurações de Upload
MAX_FILE_SIZE_MB=10
ALLOWED_IMAGE_TYPES=jpeg,jpg,png,gif,webp
ALLOWED_AUDIO_TYPES=mp3,wav,ogg,mpeg
```

### 2. Banco de Dados

**✅ Nenhuma migração necessária!** O sistema usa a estrutura existente:

- `content_type`: 'text', 'audio', 'image'
- `media_url`: URL ou dados base64 do arquivo
- `metadata`: Informações adicionais (descrição da imagem, configurações de áudio, etc.)

### 3. Formato da API Externa

O sistema espera que sua API externa aceite este formato:

```json
{
  "isBase64Encoded": false,
  "body": {
    "user_id": "user_123",
    "creator_id": "creator_456", 
    "influencer_name": "Tech Guru Sarah",
    "chat_history": [
      ["user", "Hi Sarah!"],
      ["assistant", "Hello! How can I help you today?"]
    ],
    "msgs_cnt_by_user": 5,
    "input_media_type": "text",
    "user_query": "What are the latest trends in AI?",
    "should_generate_tts": false,
    "elevenlabs_voice_id": "voice_sarah_123",
    "image_data": "base64_encoded_image_data",
    "audio_data": "base64_encoded_audio_data"
  }
}
```

E retorne este formato:

```json
{
  "statusCode": 200,
  "body": {
    "response": "The latest trends in AI include...",
    "audio_output": "base64_encoded_audio",
    "audio_output_url": "data:audio/mpeg;base64,...",
    "image_description": "Description of uploaded image",
    "should_generate_tts": true,
    "timings": {
      "retrieval": 0.5,
      "generation": 1.2,
      "tts": 2.1,
      "image_processing": 1.5
    }
  }
}
```

## 🎨 Interface do Usuário

### Botões de Upload:
- **📎 Upload**: Botão para selecionar imagens ou áudios
- **🎤 Indicador de Áudio**: Mostra quando um arquivo de áudio foi selecionado
- **🖼️ Indicador de Imagem**: Mostra quando uma imagem foi selecionada

### Exibição de Mensagens:
- **Texto**: Exibido normalmente
- **Imagens**: Mostradas com descrição da IA
- **Áudio**: Player com botões play/pause
- **Áudio da IA**: Player especial para respostas em áudio

## 🚀 Como Usar

### Para Usuários:
1. **Texto Normal**: Digite e envie normalmente
2. **Com Imagem**: Clique no botão upload, selecione uma imagem, adicione texto opcional
3. **Com Áudio**: Clique no botão upload, selecione um arquivo de áudio, adicione texto opcional

### Para Desenvolvedores:
1. **Teste Local**: Configure as variáveis de ambiente
2. **Teste Upload**: Teste com diferentes tipos de arquivo
3. **Teste Áudio**: Verifique se as respostas em áudio funcionam
4. **Teste IA**: Certifique-se de que sua API externa está funcionando

## 🔍 Debugging

### Logs Importantes:
- `🚀 Sending multimedia message:` - Request sendo enviado
- `✅ Multimedia message processed successfully:` - Resposta recebida
- `❌ AI service error:` - Erro na API externa

### Problemas Comuns:
1. **Arquivo não carrega**: Verifique tipos permitidos e tamanho máximo
2. **Áudio não toca**: Verifique se o navegador suporta o formato
3. **IA não responde**: Verifique se `AI_SERVICE_URL` está correto
4. **TTS não funciona**: Verifique configuração do ElevenLabs

## 📁 Arquivos Modificados

### Novos Arquivos:
- `src/app/api/post-multimedia-message/route.ts` - Endpoint para mensagens multimídia
- `src/components/ui/MultimediaMessage.tsx` - Componente para exibir mídia

### Arquivos Modificados:
- `src/components/Chat/ChatThread.tsx` - Interface atualizada com upload

## 🎯 Próximos Passos

1. **Configure sua API externa** para aceitar o formato especificado
2. **Configure as variáveis** de ambiente
3. **Teste todas as funcionalidades** multimídia
4. **Ajuste a lógica de áudio** conforme necessário

O sistema está pronto para uso! 🎉

## 🔍 Como Funciona

### Estrutura de Dados:
```javascript
// Mensagem do usuário
{
  content_type: 'image',        // 'text', 'audio', 'image'
  content: 'Texto opcional',
  media_url: 'data:image/...',  // Base64 ou URL
  metadata: {
    image_description: 'AI description',
    timings: {...}
  }
}

// Mensagem da IA
{
  content_type: 'audio',        // 'text' ou 'audio'
  content: 'Resposta da IA',
  media_url: 'data:audio/...',  // Base64 ou URL (se audio)
  metadata: {
    audio_generated: true,
    should_generate_tts: true,
    elevenlabs_voice_id: 'voice_123'
  }
}
```
