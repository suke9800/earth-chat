export const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '简体中文' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ru', label: 'Русский' },
  { code: 'it', label: 'Italiano' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'id', label: 'Bahasa Indonesia' },
]

export type UiLanguage = (typeof UI_LANGUAGES)[number]['code']

export const DEFAULT_UI_LANGUAGE: UiLanguage = 'en'

export type UiCopy = {
  heroTitle: string
  heroSubtitle: string
  statSingleRoomLabel: string
  statSingleRoomHint: string
  statRetentionLabel: (days: number) => string
  statRetentionHint: string
  statRealtimeLabel: string
  statRealtimeHint: string
  statLocalLabel: string
  statLocalHint: string
  statAnonymousLabel: string
  statAnonymousHint: string
  chipGlobalRoom: string
  chipRetention: (days: number) => string
  chipLanguage: string
  joinTitle: string
  nicknameLabel: string
  nicknamePlaceholder: string
  languageLabel: string
  uiLanguageLabel: string
  joinButton: string
  helperText: (days: number) => string
  roomTitle: string
  roomSubtitle: (days: number) => string
  settingsButton: string
  localModeConfigMissing: string
  localModeConnecting: string
  localModeAuthFailed: string
  localModeActive: string
  noMessages: string
  messagePlaceholder: string
  spamNotice: string
  sendButton: string
  settingsTitle: string
  settingsSubtitle: string
  backToChat: string
  saveSettings: string
  toastNicknameRequired: string
  toastJoinFirst: string
  toastSettingsUpdated: string
  toastSendFailed: string
  toastRateLimited: (seconds: number) => string
  toastMuted: (seconds: number) => string
}

const EN_COPY: UiCopy = {
  heroTitle: 'Earth Chat Room.',
  heroSubtitle: 'Anonymous global chat in a single shared space.',
  statSingleRoomLabel: 'Single room',
  statSingleRoomHint: 'Everyone in one place',
  statRetentionLabel: (days) => (days === 1 ? '1 day' : `${days} days`),
  statRetentionHint: 'Message retention',
  statRealtimeLabel: 'Realtime',
  statRealtimeHint: 'Firebase updates',
  statLocalLabel: 'Local only',
  statLocalHint: 'This device only',
  statAnonymousLabel: 'Anonymous',
  statAnonymousHint: 'No login needed',
  chipGlobalRoom: 'Global room',
  chipRetention: (days) =>
    days === 1 ? '1 day retention' : `${days} day retention`,
  chipLanguage: 'Language',
  joinTitle: 'Join the global room',
  nicknameLabel: 'Nickname',
  nicknamePlaceholder: 'Choose a nickname',
  languageLabel: 'Chat language',
  uiLanguageLabel: 'UI language',
  joinButton: 'Join Earth Chat',
  helperText: (days) =>
    days === 1
      ? 'Anonymous entry. Messages expire after 1 day.'
      : `Anonymous entry. Messages expire after ${days} days.`,
  roomTitle: 'Global Room',
  roomSubtitle: (days) =>
    days === 1
      ? 'One room for everyone. Messages expire after 1 day.'
      : `One room for everyone. Messages expire after ${days} days.`,
  settingsButton: 'Settings',
  localModeConfigMissing: 'Local mode: Firebase config missing.',
  localModeConnecting: 'Local mode: Connecting to Firebase...',
  localModeAuthFailed: 'Local mode: Firebase auth failed.',
  localModeActive: 'Local mode active.',
  noMessages: 'No messages yet. Say hi.',
  messagePlaceholder: 'Share something with the world...',
  spamNotice: 'Spam rule: 3 messages in 3s or 5 in a row = 30s mute.',
  sendButton: 'Send',
  settingsTitle: 'Settings',
  settingsSubtitle: 'Adjust your nickname and language.',
  backToChat: 'Back to chat',
  saveSettings: 'Save settings',
  toastNicknameRequired: 'Nickname is required.',
  toastJoinFirst: 'Join the room first.',
  toastSettingsUpdated: 'Settings updated.',
  toastSendFailed: 'Failed to send message.',
  toastRateLimited: (seconds) => `Too fast. Chat locked for ${seconds}s.`,
  toastMuted: (seconds) => `Chat locked. Try again in ${seconds}s.`,
}

const KO_COPY: UiCopy = {
  heroTitle: '지구 채팅방.',
  heroSubtitle: '익명으로 전 세계가 함께 대화하는 단일 공간.',
  statSingleRoomLabel: '단일 방',
  statSingleRoomHint: '모두 한 곳에서',
  statRetentionLabel: (days) => `${days}일`,
  statRetentionHint: '메시지 보관',
  statRealtimeLabel: '실시간',
  statRealtimeHint: 'Firebase 업데이트',
  statLocalLabel: '로컬 전용',
  statLocalHint: '이 기기만',
  statAnonymousLabel: '익명',
  statAnonymousHint: '로그인 불필요',
  chipGlobalRoom: '글로벌 룸',
  chipRetention: (days) => `${days}일 보관`,
  chipLanguage: '언어',
  joinTitle: '글로벌 룸 입장',
  nicknameLabel: '닉네임',
  nicknamePlaceholder: '닉네임을 입력하세요',
  languageLabel: '채팅 언어',
  uiLanguageLabel: 'UI 언어',
  joinButton: '지구챗 입장',
  helperText: (days) => `익명 입장. 메시지는 ${days}일 보관됩니다.`,
  roomTitle: '글로벌 룸',
  roomSubtitle: (days) =>
    `모두가 함께하는 한 방. 메시지는 ${days}일 보관됩니다.`,
  settingsButton: '설정',
  localModeConfigMissing: '로컬 모드: Firebase 설정이 없습니다.',
  localModeConnecting: '로컬 모드: Firebase 연결 중...',
  localModeAuthFailed: '로컬 모드: Firebase 인증 실패.',
  localModeActive: '로컬 모드 사용 중.',
  noMessages: '아직 메시지가 없어요. 인사해보세요.',
  messagePlaceholder: '세상에 한마디 남겨보세요...',
  spamNotice: '도배 방지: 3초 3회 또는 연속 5회 전송 시 30초 제한.',
  sendButton: '보내기',
  settingsTitle: '설정',
  settingsSubtitle: '닉네임과 언어를 설정하세요.',
  backToChat: '채팅으로 돌아가기',
  saveSettings: '설정 저장',
  toastNicknameRequired: '닉네임이 필요합니다.',
  toastJoinFirst: '먼저 입장하세요.',
  toastSettingsUpdated: '설정이 저장되었습니다.',
  toastSendFailed: '메시지 전송에 실패했습니다.',
  toastRateLimited: (seconds) =>
    `너무 빠릅니다. ${seconds}초 동안 채팅이 제한됩니다.`,
  toastMuted: (seconds) => `${seconds}초 동안 채팅이 제한됩니다.`,
}

const JA_COPY: UiCopy = {
  heroTitle: '地球チャットルーム。',
  heroSubtitle: '匿名で世界が集まる単一のチャット空間。',
  statSingleRoomLabel: '単一ルーム',
  statSingleRoomHint: 'みんな同じ場所',
  statRetentionLabel: (days) => `${days}日`,
  statRetentionHint: 'メッセージ保管',
  statRealtimeLabel: 'リアルタイム',
  statRealtimeHint: 'Firebase更新',
  statLocalLabel: 'ローカルのみ',
  statLocalHint: 'この端末のみ',
  statAnonymousLabel: '匿名',
  statAnonymousHint: 'ログイン不要',
  chipGlobalRoom: 'グローバルルーム',
  chipRetention: (days) => `${days}日保存`,
  chipLanguage: '言語',
  joinTitle: 'グローバルルームに参加',
  nicknameLabel: 'ニックネーム',
  nicknamePlaceholder: 'ニックネームを入力',
  languageLabel: 'チャット言語',
  uiLanguageLabel: 'UI言語',
  joinButton: 'Earth Chatに参加',
  helperText: (days) => `匿名参加。メッセージは${days}日保存されます。`,
  roomTitle: 'グローバルルーム',
  roomSubtitle: (days) =>
    `みんなが集まるひとつの部屋。メッセージは${days}日保存されます。`,
  settingsButton: '設定',
  localModeConfigMissing: 'ローカルモード: Firebase設定がありません。',
  localModeConnecting: 'ローカルモード: Firebaseに接続中...',
  localModeAuthFailed: 'ローカルモード: Firebase認証に失敗。',
  localModeActive: 'ローカルモード使用中。',
  noMessages: 'まだメッセージがありません。挨拶してみましょう。',
  messagePlaceholder: '世界に一言どうぞ...',
  spamNotice: 'スパム防止: 3秒で3回または連続5回で30秒制限。',
  sendButton: '送信',
  settingsTitle: '設定',
  settingsSubtitle: 'ニックネームと言語を設定します。',
  backToChat: 'チャットに戻る',
  saveSettings: '設定を保存',
  toastNicknameRequired: 'ニックネームが必要です。',
  toastJoinFirst: '先に参加してください。',
  toastSettingsUpdated: '設定を保存しました。',
  toastSendFailed: 'メッセージ送信に失敗しました。',
  toastRateLimited: (seconds) =>
    `送信が早すぎます。${seconds}秒間チャットが制限されます。`,
  toastMuted: (seconds) => `あと${seconds}秒間チャットが制限されています。`,
}

const FR_COPY: UiCopy = {
  heroTitle: 'Salon de chat de la Terre.',
  heroSubtitle: 'Chat mondial anonyme dans un espace unique.',
  statSingleRoomLabel: 'Salle unique',
  statSingleRoomHint: 'Tout le monde au meme endroit',
  statRetentionLabel: (days) => (days === 1 ? '1 jour' : `${days} jours`),
  statRetentionHint: 'Conservation des messages',
  statRealtimeLabel: 'Temps reel',
  statRealtimeHint: 'Mises a jour Firebase',
  statLocalLabel: 'Local seulement',
  statLocalHint: 'Cet appareil uniquement',
  statAnonymousLabel: 'Anonyme',
  statAnonymousHint: 'Aucune connexion',
  chipGlobalRoom: 'Salle globale',
  chipRetention: (days) =>
    days === 1 ? '1 jour de conservation' : `${days} jours de conservation`,
  chipLanguage: 'Langue',
  joinTitle: 'Rejoindre la salle globale',
  nicknameLabel: 'Pseudo',
  nicknamePlaceholder: 'Choisissez un pseudo',
  languageLabel: 'Langue du chat',
  uiLanguageLabel: "Langue de l'UI",
  joinButton: 'Rejoindre Earth Chat',
  helperText: (days) =>
    days === 1
      ? 'Entree anonyme. Les messages expirent apres 1 jour.'
      : `Entree anonyme. Les messages expirent apres ${days} jours.`,
  roomTitle: 'Salle globale',
  roomSubtitle: (days) =>
    days === 1
      ? 'Une seule salle pour tous. Les messages expirent apres 1 jour.'
      : `Une seule salle pour tous. Les messages expirent apres ${days} jours.`,
  settingsButton: 'Parametres',
  localModeConfigMissing: 'Mode local : configuration Firebase manquante.',
  localModeConnecting: 'Mode local : connexion a Firebase...',
  localModeAuthFailed: "Mode local : echec de l'auth Firebase.",
  localModeActive: 'Mode local actif.',
  noMessages: 'Pas encore de messages. Dites bonjour.',
  messagePlaceholder: 'Partagez quelque chose avec le monde...',
  spamNotice: "Anti-spam : 3 messages en 3s ou 5 d'affilee = 30s bloque.",
  sendButton: 'Envoyer',
  settingsTitle: 'Parametres',
  settingsSubtitle: 'Modifiez votre pseudo et la langue.',
  backToChat: 'Retour au chat',
  saveSettings: 'Enregistrer',
  toastNicknameRequired: 'Le pseudo est requis.',
  toastJoinFirst: "Rejoignez la salle d'abord.",
  toastSettingsUpdated: 'Parametres enregistres.',
  toastSendFailed: "Echec d'envoi du message.",
  toastRateLimited: (seconds) =>
    `Trop rapide. Chat bloque pendant ${seconds}s.`,
  toastMuted: (seconds) => `Chat bloque. Reessayez dans ${seconds}s.`,
}

const ES_COPY: UiCopy = {
  heroTitle: 'Sala de chat de la Tierra.',
  heroSubtitle: 'Chat global anonimo en un espacio unico.',
  statSingleRoomLabel: 'Sala unica',
  statSingleRoomHint: 'Todos en un mismo lugar',
  statRetentionLabel: (days) => (days === 1 ? '1 dia' : `${days} dias`),
  statRetentionHint: 'Retencion de mensajes',
  statRealtimeLabel: 'Tiempo real',
  statRealtimeHint: 'Actualizaciones de Firebase',
  statLocalLabel: 'Solo local',
  statLocalHint: 'Solo este dispositivo',
  statAnonymousLabel: 'Anonimo',
  statAnonymousHint: 'Sin inicio de sesion',
  chipGlobalRoom: 'Sala global',
  chipRetention: (days) =>
    days === 1 ? 'Retencion de 1 dia' : `Retencion de ${days} dias`,
  chipLanguage: 'Idioma',
  joinTitle: 'Unirse a la sala global',
  nicknameLabel: 'Apodo',
  nicknamePlaceholder: 'Elige un apodo',
  languageLabel: 'Idioma del chat',
  uiLanguageLabel: 'Idioma de la UI',
  joinButton: 'Entrar a Earth Chat',
  helperText: (days) =>
    days === 1
      ? 'Entrada anonima. Los mensajes expiran en 1 dia.'
      : `Entrada anonima. Los mensajes expiran en ${days} dias.`,
  roomTitle: 'Sala global',
  roomSubtitle: (days) =>
    days === 1
      ? 'Una sala para todos. Los mensajes expiran en 1 dia.'
      : `Una sala para todos. Los mensajes expiran en ${days} dias.`,
  settingsButton: 'Ajustes',
  localModeConfigMissing: 'Modo local: falta la configuracion de Firebase.',
  localModeConnecting: 'Modo local: conectando a Firebase...',
  localModeAuthFailed: 'Modo local: fallo la autenticacion de Firebase.',
  localModeActive: 'Modo local activo.',
  noMessages: 'Aun no hay mensajes. Saluda.',
  messagePlaceholder: 'Comparte algo con el mundo...',
  spamNotice: 'Regla anti-spam: 3 mensajes en 3s o 5 seguidos = bloqueo 30s.',
  sendButton: 'Enviar',
  settingsTitle: 'Ajustes',
  settingsSubtitle: 'Ajusta tu apodo y lenguaje.',
  backToChat: 'Volver al chat',
  saveSettings: 'Guardar ajustes',
  toastNicknameRequired: 'El apodo es obligatorio.',
  toastJoinFirst: 'Primero entra a la sala.',
  toastSettingsUpdated: 'Ajustes actualizados.',
  toastSendFailed: 'Error al enviar el mensaje.',
  toastRateLimited: (seconds) =>
    `Demasiado rapido. Chat bloqueado por ${seconds}s.`,
  toastMuted: (seconds) => `Chat bloqueado. Intenta de nuevo en ${seconds}s.`,
}

const ZH_COPY: UiCopy = {
  heroTitle: '地球聊天室。',
  heroSubtitle: '在同一个共享空间中的匿名全球聊天。',
  statSingleRoomLabel: '单一房间',
  statSingleRoomHint: '所有人在同一个地方',
  statRetentionLabel: (days) => `${days}天`,
  statRetentionHint: '消息保留',
  statRealtimeLabel: '实时',
  statRealtimeHint: 'Firebase 更新',
  statLocalLabel: '仅本地',
  statLocalHint: '仅此设备',
  statAnonymousLabel: '匿名',
  statAnonymousHint: '无需登录',
  chipGlobalRoom: '全球房间',
  chipRetention: (days) => `${days}天保留`,
  chipLanguage: '语言',
  joinTitle: '加入全球房间',
  nicknameLabel: '昵称',
  nicknamePlaceholder: '输入昵称',
  languageLabel: '聊天语言',
  uiLanguageLabel: '界面语言',
  joinButton: '加入 Earth Chat',
  helperText: (days) => `匿名进入。消息将在${days}天后过期。`,
  roomTitle: '全球房间',
  roomSubtitle: (days) => `所有人共享一个房间。消息将在${days}天后过期。`,
  settingsButton: '设置',
  localModeConfigMissing: '本地模式：缺少 Firebase 配置。',
  localModeConnecting: '本地模式：正在连接 Firebase...',
  localModeAuthFailed: '本地模式：Firebase 认证失败。',
  localModeActive: '本地模式已启用。',
  noMessages: '还没有消息。打个招呼吧。',
  messagePlaceholder: '向全世界说点什么...',
  spamNotice: '防刷规则：3秒3条或连续5条，将禁言30秒。',
  sendButton: '发送',
  settingsTitle: '设置',
  settingsSubtitle: '调整你的昵称和语言。',
  backToChat: '返回聊天',
  saveSettings: '保存设置',
  toastNicknameRequired: '昵称是必填项。',
  toastJoinFirst: '请先加入房间。',
  toastSettingsUpdated: '设置已更新。',
  toastSendFailed: '消息发送失败。',
  toastRateLimited: (seconds) => `发送过快。聊天已锁定 ${seconds} 秒。`,
  toastMuted: (seconds) => `聊天已锁定。请在 ${seconds} 秒后重试。`,
}

const PT_COPY: UiCopy = {
  heroTitle: 'Sala de chat da Terra.',
  heroSubtitle: 'Chat global anonimo em um espaco unico.',
  statSingleRoomLabel: 'Sala unica',
  statSingleRoomHint: 'Todos no mesmo lugar',
  statRetentionLabel: (days) => (days === 1 ? '1 dia' : `${days} dias`),
  statRetentionHint: 'Retencao de mensagens',
  statRealtimeLabel: 'Tempo real',
  statRealtimeHint: 'Atualizacoes do Firebase',
  statLocalLabel: 'Somente local',
  statLocalHint: 'Somente este dispositivo',
  statAnonymousLabel: 'Anonimo',
  statAnonymousHint: 'Sem login',
  chipGlobalRoom: 'Sala global',
  chipRetention: (days) =>
    days === 1 ? 'Retencao de 1 dia' : `Retencao de ${days} dias`,
  chipLanguage: 'Idioma',
  joinTitle: 'Entrar na sala global',
  nicknameLabel: 'Apelido',
  nicknamePlaceholder: 'Escolha um apelido',
  languageLabel: 'Idioma do chat',
  uiLanguageLabel: 'Idioma da UI',
  joinButton: 'Entrar no Earth Chat',
  helperText: (days) =>
    days === 1
      ? 'Entrada anonima. Mensagens expiram apos 1 dia.'
      : `Entrada anonima. Mensagens expiram apos ${days} dias.`,
  roomTitle: 'Sala global',
  roomSubtitle: (days) =>
    days === 1
      ? 'Uma sala para todos. Mensagens expiram apos 1 dia.'
      : `Uma sala para todos. Mensagens expiram apos ${days} dias.`,
  settingsButton: 'Configuracoes',
  localModeConfigMissing: 'Modo local: configuracao do Firebase ausente.',
  localModeConnecting: 'Modo local: conectando ao Firebase...',
  localModeAuthFailed: 'Modo local: falha na autenticacao do Firebase.',
  localModeActive: 'Modo local ativo.',
  noMessages: 'Ainda nao ha mensagens. Diga oi.',
  messagePlaceholder: 'Compartilhe algo com o mundo...',
  spamNotice:
    'Regra anti-spam: 3 mensagens em 3s ou 5 seguidas = bloqueio de 30s.',
  sendButton: 'Enviar',
  settingsTitle: 'Configuracoes',
  settingsSubtitle: 'Ajuste seu apelido e idioma.',
  backToChat: 'Voltar ao chat',
  saveSettings: 'Salvar configuracoes',
  toastNicknameRequired: 'Apelido e obrigatorio.',
  toastJoinFirst: 'Entre na sala primeiro.',
  toastSettingsUpdated: 'Configuracoes atualizadas.',
  toastSendFailed: 'Falha ao enviar mensagem.',
  toastRateLimited: (seconds) =>
    `Muito rapido. Chat bloqueado por ${seconds}s.`,
  toastMuted: (seconds) => `Chat bloqueado. Tente novamente em ${seconds}s.`,
}

const DE_COPY: UiCopy = {
  heroTitle: 'Erde-Chatraum.',
  heroSubtitle: 'Anonymer globaler Chat in einem gemeinsamen Raum.',
  statSingleRoomLabel: 'Ein Raum',
  statSingleRoomHint: 'Alle an einem Ort',
  statRetentionLabel: (days) => (days === 1 ? '1 Tag' : `${days} Tage`),
  statRetentionHint: 'Nachrichtenspeicherung',
  statRealtimeLabel: 'Echtzeit',
  statRealtimeHint: 'Firebase-Updates',
  statLocalLabel: 'Nur lokal',
  statLocalHint: 'Nur dieses Geraet',
  statAnonymousLabel: 'Anonym',
  statAnonymousHint: 'Kein Login erforderlich',
  chipGlobalRoom: 'Globaler Raum',
  chipRetention: (days) =>
    days === 1 ? '1 Tag Speicherung' : `${days} Tage Speicherung`,
  chipLanguage: 'Sprache',
  joinTitle: 'Globalem Raum beitreten',
  nicknameLabel: 'Nickname',
  nicknamePlaceholder: 'Nickname waehlen',
  languageLabel: 'Chat-Sprache',
  uiLanguageLabel: 'UI-Sprache',
  joinButton: 'Earth Chat beitreten',
  helperText: (days) =>
    days === 1
      ? 'Anonymer Eintritt. Nachrichten verfallen nach 1 Tag.'
      : `Anonymer Eintritt. Nachrichten verfallen nach ${days} Tagen.`,
  roomTitle: 'Globaler Raum',
  roomSubtitle: (days) =>
    days === 1
      ? 'Ein Raum fuer alle. Nachrichten verfallen nach 1 Tag.'
      : `Ein Raum fuer alle. Nachrichten verfallen nach ${days} Tagen.`,
  settingsButton: 'Einstellungen',
  localModeConfigMissing: 'Lokaler Modus: Firebase-Konfiguration fehlt.',
  localModeConnecting: 'Lokaler Modus: Verbindung zu Firebase...',
  localModeAuthFailed:
    'Lokaler Modus: Firebase-Authentifizierung fehlgeschlagen.',
  localModeActive: 'Lokaler Modus aktiv.',
  noMessages: 'Noch keine Nachrichten. Sag hallo.',
  messagePlaceholder: 'Teile etwas mit der Welt...',
  spamNotice:
    'Spam-Regel: 3 Nachrichten in 3s oder 5 hintereinander = 30s Sperre.',
  sendButton: 'Senden',
  settingsTitle: 'Einstellungen',
  settingsSubtitle: 'Passe deinen Nickname und deine Sprache an.',
  backToChat: 'Zurueck zum Chat',
  saveSettings: 'Einstellungen speichern',
  toastNicknameRequired: 'Nickname ist erforderlich.',
  toastJoinFirst: 'Tritt zuerst dem Raum bei.',
  toastSettingsUpdated: 'Einstellungen aktualisiert.',
  toastSendFailed: 'Nachricht konnte nicht gesendet werden.',
  toastRateLimited: (seconds) => `Zu schnell. Chat fuer ${seconds}s gesperrt.`,
  toastMuted: (seconds) => `Chat gesperrt. In ${seconds}s erneut versuchen.`,
}

const AR_COPY: UiCopy = {
  heroTitle: 'غرفة دردشة الأرض.',
  heroSubtitle: 'دردشة عالمية مجهولة في مساحة واحدة مشتركة.',
  statSingleRoomLabel: 'غرفة واحدة',
  statSingleRoomHint: 'الجميع في مكان واحد',
  statRetentionLabel: (days) => `${days} يوم`,
  statRetentionHint: 'الاحتفاظ بالرسائل',
  statRealtimeLabel: 'لحظي',
  statRealtimeHint: 'تحديثات Firebase',
  statLocalLabel: 'محلي فقط',
  statLocalHint: 'هذا الجهاز فقط',
  statAnonymousLabel: 'مجهول',
  statAnonymousHint: 'بدون تسجيل دخول',
  chipGlobalRoom: 'الغرفة العالمية',
  chipRetention: (days) => `احتفاظ ${days} يوم`,
  chipLanguage: 'اللغة',
  joinTitle: 'انضم إلى الغرفة العالمية',
  nicknameLabel: 'الاسم المستعار',
  nicknamePlaceholder: 'اختر اسمًا مستعارًا',
  languageLabel: 'لغة الدردشة',
  uiLanguageLabel: 'لغة الواجهة',
  joinButton: 'انضم إلى Earth Chat',
  helperText: (days) => `دخول مجهول. تنتهي الرسائل بعد ${days} يوم.`,
  roomTitle: 'الغرفة العالمية',
  roomSubtitle: (days) => `غرفة واحدة للجميع. تنتهي الرسائل بعد ${days} يوم.`,
  settingsButton: 'الإعدادات',
  localModeConfigMissing: 'الوضع المحلي: إعداد Firebase مفقود.',
  localModeConnecting: 'الوضع المحلي: جاري الاتصال بـ Firebase...',
  localModeAuthFailed: 'الوضع المحلي: فشل توثيق Firebase.',
  localModeActive: 'الوضع المحلي نشط.',
  noMessages: 'لا توجد رسائل بعد. قل مرحبًا.',
  messagePlaceholder: 'شارك شيئًا مع العالم...',
  spamNotice:
    'قاعدة منع الإزعاج: 3 رسائل خلال 3 ثوان أو 5 متتالية = حظر 30 ثانية.',
  sendButton: 'إرسال',
  settingsTitle: 'الإعدادات',
  settingsSubtitle: 'عدّل الاسم المستعار واللغة.',
  backToChat: 'العودة إلى الدردشة',
  saveSettings: 'حفظ الإعدادات',
  toastNicknameRequired: 'الاسم المستعار مطلوب.',
  toastJoinFirst: 'انضم إلى الغرفة أولاً.',
  toastSettingsUpdated: 'تم تحديث الإعدادات.',
  toastSendFailed: 'فشل إرسال الرسالة.',
  toastRateLimited: (seconds) => `سريع جدًا. تم قفل الدردشة لمدة ${seconds} ث.`,
  toastMuted: (seconds) => `الدردشة مقفلة. حاول مرة أخرى بعد ${seconds} ث.`,
}

const HI_COPY: UiCopy = {
  heroTitle: 'पृथ्वी चैट रूम।',
  heroSubtitle: 'एक साझा जगह में अनाम वैश्विक चैट।',
  statSingleRoomLabel: 'एक कमरा',
  statSingleRoomHint: 'सब एक ही जगह',
  statRetentionLabel: (days) => `${days} दिन`,
  statRetentionHint: 'संदेश संग्रह',
  statRealtimeLabel: 'रियल-टाइम',
  statRealtimeHint: 'Firebase अपडेट',
  statLocalLabel: 'सिर्फ लोकल',
  statLocalHint: 'सिर्फ यह डिवाइस',
  statAnonymousLabel: 'अनाम',
  statAnonymousHint: 'लॉगिन की जरूरत नहीं',
  chipGlobalRoom: 'ग्लोबल रूम',
  chipRetention: (days) => `${days} दिन संग्रह`,
  chipLanguage: 'भाषा',
  joinTitle: 'ग्लोबल रूम में शामिल हों',
  nicknameLabel: 'निकनेम',
  nicknamePlaceholder: 'निकनेम चुनें',
  languageLabel: 'चैट भाषा',
  uiLanguageLabel: 'UI भाषा',
  joinButton: 'Earth Chat जॉइन करें',
  helperText: (days) => `अनाम प्रवेश। संदेश ${days} दिन बाद समाप्त होते हैं।`,
  roomTitle: 'ग्लोबल रूम',
  roomSubtitle: (days) =>
    `सभी के लिए एक कमरा। संदेश ${days} दिन बाद समाप्त होते हैं।`,
  settingsButton: 'सेटिंग्स',
  localModeConfigMissing: 'लोकल मोड: Firebase कॉन्फ़िग नहीं मिला।',
  localModeConnecting: 'लोकल मोड: Firebase से कनेक्ट हो रहा है...',
  localModeAuthFailed: 'लोकल मोड: Firebase प्रमाणीकरण विफल।',
  localModeActive: 'लोकल मोड सक्रिय है।',
  noMessages: 'अभी कोई संदेश नहीं। नमस्ते कहें।',
  messagePlaceholder: 'दुनिया से कुछ शेयर करें...',
  spamNotice:
    'स्पैम नियम: 3 सेकंड में 3 संदेश या लगातार 5 संदेश = 30 सेकंड म्यूट।',
  sendButton: 'भेजें',
  settingsTitle: 'सेटिंग्स',
  settingsSubtitle: 'अपना निकनेम और भाषा बदलें।',
  backToChat: 'चैट पर वापस',
  saveSettings: 'सेटिंग्स सेव करें',
  toastNicknameRequired: 'निकनेम जरूरी है।',
  toastJoinFirst: 'पहले रूम जॉइन करें।',
  toastSettingsUpdated: 'सेटिंग्स अपडेट हो गईं।',
  toastSendFailed: 'संदेश भेजना विफल हुआ।',
  toastRateLimited: (seconds) => `बहुत तेज। चैट ${seconds} सेकंड के लिए लॉक है।`,
  toastMuted: (seconds) => `चैट लॉक है। ${seconds} सेकंड बाद फिर कोशिश करें।`,
}

const RU_COPY: UiCopy = {
  heroTitle: 'Глобальный чат Земли.',
  heroSubtitle: 'Анонимный глобальный чат в одном общем пространстве.',
  statSingleRoomLabel: 'Одна комната',
  statSingleRoomHint: 'Все в одном месте',
  statRetentionLabel: (days) => `${days} дн.`,
  statRetentionHint: 'Хранение сообщений',
  statRealtimeLabel: 'В реальном времени',
  statRealtimeHint: 'Обновления Firebase',
  statLocalLabel: 'Только локально',
  statLocalHint: 'Только это устройство',
  statAnonymousLabel: 'Анонимно',
  statAnonymousHint: 'Без входа',
  chipGlobalRoom: 'Глобальная комната',
  chipRetention: (days) => `Хранение ${days} дн.`,
  chipLanguage: 'Язык',
  joinTitle: 'Войти в глобальную комнату',
  nicknameLabel: 'Никнейм',
  nicknamePlaceholder: 'Выберите никнейм',
  languageLabel: 'Язык чата',
  uiLanguageLabel: 'Язык интерфейса',
  joinButton: 'Войти в Earth Chat',
  helperText: (days) =>
    `Анонимный вход. Сообщения удаляются через ${days} дн.`,
  roomTitle: 'Глобальная комната',
  roomSubtitle: (days) =>
    `Одна комната для всех. Сообщения удаляются через ${days} дн.`,
  settingsButton: 'Настройки',
  localModeConfigMissing:
    'Локальный режим: отсутствует конфигурация Firebase.',
  localModeConnecting: 'Локальный режим: подключение к Firebase...',
  localModeAuthFailed: 'Локальный режим: ошибка аутентификации Firebase.',
  localModeActive: 'Локальный режим активен.',
  noMessages: 'Пока нет сообщений. Напишите привет.',
  messagePlaceholder: 'Поделитесь чем-то с миром...',
  spamNotice: 'Антиспам: 3 сообщения за 3с или 5 подряд = блок на 30с.',
  sendButton: 'Отправить',
  settingsTitle: 'Настройки',
  settingsSubtitle: 'Измените никнейм и язык.',
  backToChat: 'Назад в чат',
  saveSettings: 'Сохранить настройки',
  toastNicknameRequired: 'Никнейм обязателен.',
  toastJoinFirst: 'Сначала войдите в комнату.',
  toastSettingsUpdated: 'Настройки обновлены.',
  toastSendFailed: 'Не удалось отправить сообщение.',
  toastRateLimited: (seconds) => `Слишком быстро. Чат заблокирован на ${seconds}с.`,
  toastMuted: (seconds) => `Чат заблокирован. Повторите через ${seconds}с.`,
}

const IT_COPY: UiCopy = {
  heroTitle: 'Stanza chat della Terra.',
  heroSubtitle: 'Chat globale anonima in un unico spazio condiviso.',
  statSingleRoomLabel: 'Stanza unica',
  statSingleRoomHint: 'Tutti nello stesso posto',
  statRetentionLabel: (days) => (days === 1 ? '1 giorno' : `${days} giorni`),
  statRetentionHint: 'Conservazione messaggi',
  statRealtimeLabel: 'Tempo reale',
  statRealtimeHint: 'Aggiornamenti Firebase',
  statLocalLabel: 'Solo locale',
  statLocalHint: 'Solo questo dispositivo',
  statAnonymousLabel: 'Anonimo',
  statAnonymousHint: 'Nessun login richiesto',
  chipGlobalRoom: 'Stanza globale',
  chipRetention: (days) =>
    days === 1 ? 'Conservazione 1 giorno' : `Conservazione ${days} giorni`,
  chipLanguage: 'Lingua',
  joinTitle: 'Entra nella stanza globale',
  nicknameLabel: 'Nickname',
  nicknamePlaceholder: 'Scegli un nickname',
  languageLabel: 'Lingua chat',
  uiLanguageLabel: 'Lingua UI',
  joinButton: 'Entra in Earth Chat',
  helperText: (days) =>
    days === 1
      ? 'Accesso anonimo. I messaggi scadono dopo 1 giorno.'
      : `Accesso anonimo. I messaggi scadono dopo ${days} giorni.`,
  roomTitle: 'Stanza globale',
  roomSubtitle: (days) =>
    days === 1
      ? 'Una stanza per tutti. I messaggi scadono dopo 1 giorno.'
      : `Una stanza per tutti. I messaggi scadono dopo ${days} giorni.`,
  settingsButton: 'Impostazioni',
  localModeConfigMissing: 'Modalita locale: configurazione Firebase mancante.',
  localModeConnecting: 'Modalita locale: connessione a Firebase...',
  localModeAuthFailed: 'Modalita locale: autenticazione Firebase fallita.',
  localModeActive: 'Modalita locale attiva.',
  noMessages: 'Nessun messaggio. Saluta tu per primo.',
  messagePlaceholder: 'Condividi qualcosa con il mondo...',
  spamNotice: 'Regola anti-spam: 3 messaggi in 3s o 5 di fila = blocco 30s.',
  sendButton: 'Invia',
  settingsTitle: 'Impostazioni',
  settingsSubtitle: 'Modifica nickname e lingua.',
  backToChat: 'Torna alla chat',
  saveSettings: 'Salva impostazioni',
  toastNicknameRequired: 'Il nickname e obbligatorio.',
  toastJoinFirst: 'Entra prima nella stanza.',
  toastSettingsUpdated: 'Impostazioni aggiornate.',
  toastSendFailed: 'Invio del messaggio non riuscito.',
  toastRateLimited: (seconds) => `Troppo veloce. Chat bloccata per ${seconds}s.`,
  toastMuted: (seconds) => `Chat bloccata. Riprova tra ${seconds}s.`,
}

const TR_COPY: UiCopy = {
  heroTitle: 'Dunya Sohbet Odasi.',
  heroSubtitle: 'Tek bir ortak alanda anonim global sohbet.',
  statSingleRoomLabel: 'Tek oda',
  statSingleRoomHint: 'Herkes tek yerde',
  statRetentionLabel: (days) => `${days} gun`,
  statRetentionHint: 'Mesaj saklama',
  statRealtimeLabel: 'Gercek zamanli',
  statRealtimeHint: 'Firebase guncellemeleri',
  statLocalLabel: 'Sadece yerel',
  statLocalHint: 'Sadece bu cihaz',
  statAnonymousLabel: 'Anonim',
  statAnonymousHint: 'Giris gerekmez',
  chipGlobalRoom: 'Global oda',
  chipRetention: (days) => `${days} gun saklama`,
  chipLanguage: 'Dil',
  joinTitle: 'Global odaya katil',
  nicknameLabel: 'Takma ad',
  nicknamePlaceholder: 'Takma ad sec',
  languageLabel: 'Sohbet dili',
  uiLanguageLabel: 'UI dili',
  joinButton: "Earth Chat'e katil",
  helperText: (days) => `Anonim giris. Mesajlar ${days} gun sonra silinir.`,
  roomTitle: 'Global oda',
  roomSubtitle: (days) =>
    `Herkes icin tek oda. Mesajlar ${days} gun sonra silinir.`,
  settingsButton: 'Ayarlar',
  localModeConfigMissing: 'Yerel mod: Firebase yapilandirmasi eksik.',
  localModeConnecting: "Yerel mod: Firebase'e baglaniyor...",
  localModeAuthFailed: 'Yerel mod: Firebase kimlik dogrulama hatasi.',
  localModeActive: 'Yerel mod aktif.',
  noMessages: 'Henuz mesaj yok. Selam yaz.',
  messagePlaceholder: 'Dunya ile bir sey paylas...',
  spamNotice:
    'Spam kurali: 3 sn icinde 3 mesaj veya ust uste 5 mesaj = 30 sn susturma.',
  sendButton: 'Gonder',
  settingsTitle: 'Ayarlar',
  settingsSubtitle: 'Takma adini ve dilini ayarla.',
  backToChat: 'Sohbete don',
  saveSettings: 'Ayarlari kaydet',
  toastNicknameRequired: 'Takma ad gerekli.',
  toastJoinFirst: 'Once odaya katil.',
  toastSettingsUpdated: 'Ayarlar guncellendi.',
  toastSendFailed: 'Mesaj gonderilemedi.',
  toastRateLimited: (seconds) => `Cok hizli. Sohbet ${seconds}s kilitlendi.`,
  toastMuted: (seconds) => `Sohbet kilitli. ${seconds}s sonra tekrar dene.`,
}

const ID_COPY: UiCopy = {
  heroTitle: 'Ruang Chat Bumi.',
  heroSubtitle: 'Chat global anonim dalam satu ruang bersama.',
  statSingleRoomLabel: 'Satu ruang',
  statSingleRoomHint: 'Semua di satu tempat',
  statRetentionLabel: (days) => `${days} hari`,
  statRetentionHint: 'Retensi pesan',
  statRealtimeLabel: 'Waktu nyata',
  statRealtimeHint: 'Pembaruan Firebase',
  statLocalLabel: 'Hanya lokal',
  statLocalHint: 'Hanya perangkat ini',
  statAnonymousLabel: 'Anonim',
  statAnonymousHint: 'Tanpa login',
  chipGlobalRoom: 'Ruang global',
  chipRetention: (days) => `Retensi ${days} hari`,
  chipLanguage: 'Bahasa',
  joinTitle: 'Gabung ruang global',
  nicknameLabel: 'Nama panggilan',
  nicknamePlaceholder: 'Pilih nama panggilan',
  languageLabel: 'Bahasa chat',
  uiLanguageLabel: 'Bahasa UI',
  joinButton: 'Gabung Earth Chat',
  helperText: (days) => `Masuk anonim. Pesan kedaluwarsa setelah ${days} hari.`,
  roomTitle: 'Ruang global',
  roomSubtitle: (days) =>
    `Satu ruang untuk semua. Pesan kedaluwarsa setelah ${days} hari.`,
  settingsButton: 'Pengaturan',
  localModeConfigMissing: 'Mode lokal: konfigurasi Firebase tidak ada.',
  localModeConnecting: 'Mode lokal: menghubungkan ke Firebase...',
  localModeAuthFailed: 'Mode lokal: autentikasi Firebase gagal.',
  localModeActive: 'Mode lokal aktif.',
  noMessages: 'Belum ada pesan. Sapa dulu.',
  messagePlaceholder: 'Bagikan sesuatu ke dunia...',
  spamNotice:
    'Aturan spam: 3 pesan dalam 3 dtk atau 5 beruntun = mute 30 dtk.',
  sendButton: 'Kirim',
  settingsTitle: 'Pengaturan',
  settingsSubtitle: 'Atur nama panggilan dan bahasa.',
  backToChat: 'Kembali ke chat',
  saveSettings: 'Simpan pengaturan',
  toastNicknameRequired: 'Nama panggilan wajib diisi.',
  toastJoinFirst: 'Masuk ke ruang dulu.',
  toastSettingsUpdated: 'Pengaturan diperbarui.',
  toastSendFailed: 'Gagal mengirim pesan.',
  toastRateLimited: (seconds) =>
    `Terlalu cepat. Chat dikunci selama ${seconds} dtk.`,
  toastMuted: (seconds) => `Chat terkunci. Coba lagi dalam ${seconds} dtk.`,
}

export const UI_COPY: Record<UiLanguage, UiCopy> = {
  en: EN_COPY,
  ko: KO_COPY,
  ja: JA_COPY,
  fr: FR_COPY,
  es: ES_COPY,
  zh: ZH_COPY,
  pt: PT_COPY,
  de: DE_COPY,
  ar: AR_COPY,
  hi: HI_COPY,
  ru: RU_COPY,
  it: IT_COPY,
  tr: TR_COPY,
  id: ID_COPY,
}

export type UiExtraCopy = {
  dashboardButton: string
  dashboardTitle: string
  dashboardSubtitle: string
  openChatRoomButton: string
  controlSearchLabel: string
  controlTranslateLabel: string
  controlDensityLabel: string
  controlPerfLabel: string
  controlPerfHint: string
  controlPaymentLabel: string
  controlStressLabel: string
  launchChecklistTitle: string
  launchChecklistSubtitle: string
  launchSummary: (webReady: boolean, playReady: boolean) => string
  launchItemFirebaseConfig: string
  launchItemAuthHandshake: string
  launchItemCloudSync: string
  launchItemAndroidPackage: string
  launchItemFunctionsRegion: string
  launchBadgeReady: string
  launchBadgePending: string
  launchNextStep: (missingCount: number) => string
  launchExternalNote: string
  superChatTestButton: string
  subscriptionPlanTitle: string
  subscriptionPriceHint: string
  subscriptionStatus: (tier: 'earth' | 'space' | null) => string
  subscriptionEarthButton: string
  subscriptionSpaceButton: string
  subscriptionFreeButton: string
  subscriptionEarthTestButton: string
  subscriptionSpaceTestButton: string
  subscriptionFreeTestButton: string
  subscriptionSpaceTag: string
  subscriptionEarthTag: string
  subscriptionSpacePlaceholder: string
  subscriptionEarthPlaceholder: string
  previewMobileButton: string
  previewDesktopButton: string
  superChatSlotPlaceholder: string
  superChatEarthTag: string
  superChatSpaceTag: string
  joinWithGoogleButton: string
  helperPaidLogin: string
  searchPlaceholder: string
  spamRuleNotice: string
  translateToggleOn: string
  translateToggleOff: string
  translateLanguageLabel: string
  translateTargetLabel: (language: string) => string
  translateTestModeHint: string
  translatedBadge: string
  resultsShown: (filtered: number, total: number) => string
  densityCompact: string
  densityComfortable: string
  perfToggle: string
  jumpToLatest: (count: number) => string
  perfFpsLabel: string
  perfRenderLabel: string
  perfStorageLabel: string
  perfBatchSizeLabel: string
  perfLimitLabel: string
  perfModeLabel: string
  perfModeLocal: string
  perfModeFirebase: string
  stressInjecting: string
  stressInjectButton: string
  stressLocalOnly: string
  stressAdded: (count: number) => string
  stressInsertFailed: string
  paidModeGoogle: string
  paidModeGuest: string
  googleLoginButton: string
  toastGoogleJoinNeedsFirebase: string
  toastJoinedWithGoogle: string
  toastGooglePaymentConnected: string
  toastGoogleLoginFailed: string
  toastLocalSaveFailed: string
  toastPaymentsRequireServer: string
  toastWriteMessageFirst: string
  toastRateWarning: string
  toastPurchaseAndroidOnly: string
  toastMissingAndroidPackage: string
  toastUnknownPaidProduct: string
  toastGoogleRequiredForPayment: string
  toastPurchaseCanceled: (reason?: string) => string
  toastMissingPurchaseToken: string
  toastSpaceSentSuccess: string
  toastEarthSentSuccess: string
  toastPaymentPending: string
  toastPaymentRejected: (reason?: string) => string
  toastPaymentVerifyFailed: string
  toastSuperChatTestSent: (tier: 'earth' | 'space') => string
  toastSubscriptionTierUpdated: (tier: 'earth' | 'space' | null) => string
}

export type ResolvedUiCopy = UiCopy & UiExtraCopy

const EN_EXTRA: UiExtraCopy = {
  dashboardButton: 'Dashboard',
  dashboardTitle: 'Main Control Center',
  dashboardSubtitle:
    'Tune filters, density, performance, and payment mode before entering the room.',
  openChatRoomButton: 'Enter Earth Tok Room',
  controlSearchLabel: 'Search Filter',
  controlTranslateLabel: 'Auto Translate',
  controlDensityLabel: 'Message Density',
  controlPerfLabel: 'Performance',
  controlPerfHint: 'Enable perf panel to inspect rendering and storage metrics.',
  controlPaymentLabel: 'Payment Mode',
  controlStressLabel: 'Local Stress Test',
  launchChecklistTitle: 'Launch Readiness',
  launchChecklistSubtitle:
    'Finish these checks now, then connect Google Play + Firebase later for one-step launch.',
  launchSummary: (webReady, playReady) =>
    webReady && playReady
      ? 'Web + Play launch profile is ready.'
      : webReady
        ? 'Web is ready. Play setup is pending.'
        : 'Web/Play launch profile is not ready yet.',
  launchItemFirebaseConfig: 'Firebase environment variables',
  launchItemAuthHandshake: 'Firebase auth handshake',
  launchItemCloudSync: 'Realtime cloud mode enabled',
  launchItemAndroidPackage: 'Android package name configured',
  launchItemFunctionsRegion: 'Functions region configured',
  launchBadgeReady: 'Ready',
  launchBadgePending: 'Pending',
  launchNextStep: (missingCount) =>
    missingCount <= 0
      ? 'No blockers found. You can move to release builds.'
      : `${missingCount} blocker(s) remain. Fill env values and reconnect Firebase.`,
  launchExternalNote:
    'Developer account approval and Play Console policy steps are done outside this app.',
  superChatTestButton: 'Super Chat Test',
  subscriptionPlanTitle: 'Subscription',
  subscriptionPriceHint: 'Earth $1/month, Space $10/month',
  subscriptionStatus: (tier) =>
    tier === 'space'
      ? 'Current tier: Space'
      : tier === 'earth'
        ? 'Current tier: Earth'
        : 'Current tier: Free',
  subscriptionEarthButton: 'Earth Plan',
  subscriptionSpaceButton: 'Space Plan',
  subscriptionFreeButton: 'Free Plan',
  subscriptionEarthTestButton: 'Test Earth',
  subscriptionSpaceTestButton: 'Test Space',
  subscriptionFreeTestButton: 'Test Free',
  subscriptionSpaceTag: 'SPACE',
  subscriptionEarthTag: 'EARTH',
  subscriptionSpacePlaceholder: 'Space tier messages appear here',
  subscriptionEarthPlaceholder: 'Earth tier messages appear here',
  previewMobileButton: 'Mobile Preview',
  previewDesktopButton: 'Desktop Preview',
  superChatSlotPlaceholder: 'Super Chat spotlight',
  superChatEarthTag: 'EARTH $1',
  superChatSpaceTag: 'SPACE $10',
  joinWithGoogleButton: 'Join with Google',
  helperPaidLogin: 'Guest login is chat-only. Super Chat needs Google login.',
  searchPlaceholder: 'Search message or nickname',
  spamRuleNotice:
    'Spam rule: 5 messages in 3s or 12 in 20s = 10s mute. Warning appears 2 messages before limit.',
  translateToggleOn: 'Translate On',
  translateToggleOff: 'Translate Off',
  translateLanguageLabel: 'Translation Language',
  translateTargetLabel: (language) => `Target: ${language}`,
  translateTestModeHint:
    'Realtime translation mode: incoming messages are translated live to your selected language.',
  translatedBadge: 'Translated',
  resultsShown: (filtered, total) => `${filtered}/${total} shown`,
  densityCompact: 'Compact',
  densityComfortable: 'Comfortable',
  perfToggle: 'Perf',
  jumpToLatest: (count) => `${count} new messages - jump to latest`,
  perfFpsLabel: 'FPS',
  perfRenderLabel: 'Render',
  perfStorageLabel: 'Storage',
  perfBatchSizeLabel: 'Batch size',
  perfLimitLabel: 'Limit',
  perfModeLabel: 'Mode',
  perfModeLocal: 'Local',
  perfModeFirebase: 'Firebase',
  stressInjecting: 'Injecting...',
  stressInjectButton: 'Inject Stress Messages',
  stressLocalOnly: 'Stress test is local-mode only.',
  stressAdded: (count) => `${count} stress messages added.`,
  stressInsertFailed: 'Stress insert failed.',
  paidModeGoogle: 'Mode: Google (chat + paid)',
  paidModeGuest: 'Mode: Guest (chat only)',
  googleLoginButton: 'Google Login',
  toastGoogleJoinNeedsFirebase:
    'Google login needs Firebase mode. Join as guest for now.',
  toastJoinedWithGoogle: 'Joined with Google account.',
  toastGooglePaymentConnected: 'Google payment login connected.',
  toastGoogleLoginFailed: 'Google login failed.',
  toastLocalSaveFailed: 'Local save failed.',
  toastPaymentsRequireServer: 'Payments require Firebase server mode.',
  toastWriteMessageFirst: 'Write a message first.',
  toastRateWarning:
    'You are sending messages too quickly. Slow down or chat may be locked.',
  toastPurchaseAndroidOnly:
    'Super Chat purchase is available in Android app only.',
  toastMissingAndroidPackage:
    'Missing Android package name. Set VITE_ANDROID_PACKAGE_NAME.',
  toastUnknownPaidProduct: 'Unknown paid product.',
  toastGoogleRequiredForPayment:
    'Google login is required for Super Chat payments.',
  toastPurchaseCanceled: (reason) =>
    reason ? `Purchase canceled: ${reason}` : 'Purchase canceled.',
  toastMissingPurchaseToken: 'Missing purchase token.',
  toastSpaceSentSuccess: 'Space Chat sent successfully.',
  toastEarthSentSuccess: 'Earth Chat sent successfully.',
  toastPaymentPending: 'Payment is pending.',
  toastPaymentRejected: (reason) =>
    reason ? `Payment rejected: ${reason}` : 'Payment rejected.',
  toastPaymentVerifyFailed: 'Payment verification failed.',
  toastSuperChatTestSent: (tier) =>
    tier === 'space'
      ? 'Test Space Chat sent successfully.'
      : 'Test Earth Chat sent successfully.',
  toastSubscriptionTierUpdated: (tier) =>
    tier === 'space'
      ? 'Space tier test enabled.'
      : tier === 'earth'
        ? 'Earth tier test enabled.'
        : 'Free tier active.',
}

const KO_EXTRA: Partial<UiExtraCopy> = {
  dashboardButton: '\uB300\uC2DC\uBCF4\uB4DC',
  dashboardTitle: '\uBA54\uC778 \uCEE8\uD2B8\uB864 \uC13C\uD130',
  dashboardSubtitle:
    '\uCC44\uD305\uBC29\uC5D0 \uB4E4\uC5B4\uAC00\uAE30 \uC804\uC5D0 \uD544\uD130, \uBC00\uB3C4, \uC131\uB2A5, \uACB0\uC81C \uBAA8\uB4DC\uB97C \uBA3C\uC800 \uC870\uC815\uD558\uC138\uC694.',
  openChatRoomButton: '\uC9C0\uAD6C\uD1A1\uBC29 \uC785\uC7A5',
  controlSearchLabel: '\uAC80\uC0C9 \uD544\uD130',
  controlTranslateLabel: '\uC790\uB3D9 \uBC88\uC5ED',
  controlDensityLabel: '\uBA54\uC2DC\uC9C0 \uBC00\uB3C4',
  controlPerfLabel: '\uC131\uB2A5',
  controlPerfHint:
    '\uC131\uB2A5 \uD328\uB110\uC744 \uCF1C\uBA74 \uB80C\uB354\uB9C1/\uC800\uC7A5\uC18C \uC9C0\uD45C\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
  controlPaymentLabel: '\uACB0\uC81C \uBAA8\uB4DC',
  controlStressLabel: '\uB85C\uCEEC \uBD80\uD558 \uD14C\uC2A4\uD2B8',
  launchChecklistTitle: '\uCD9C\uC2DC \uC900\uBE44 \uC0C1\uD0DC',
  launchChecklistSubtitle:
    '\uC9C0\uAE08 \uCCB4\uD06C\ub9ac\uc2a4\ud2b8\ub9cc \uB9DE\uCD94\uBA74, \uB098\uC911\uC5D0 Google Play/Firebase \uC5F0\uACB0 \uD6C4 \uBC14\uB85C \uCD9C\uC2DC \uAC00\uB2A5\uD569\uB2C8\uB2E4.',
  launchSummary: (webReady, playReady) =>
    webReady && playReady
      ? '\uC6F9 + \uD50C\uB808\uC774 \uCD9C\uC2DC \uD504\uB85C\uD544 \uC900\uBE44 \uC644\uB8CC'
      : webReady
        ? '\uC6F9 \uCD9C\uC2DC \uC900\uBE44 \uC644\uB8CC, \uD50C\uB808\uC774 \uC138\uD305 \uB300\uAE30'
        : '\uC6F9/\uD50C\uB808\uC774 \uCD9C\uC2DC \uC900\uBE44 \uBBF8\uC644\uB8CC',
  launchItemFirebaseConfig: 'Firebase \uD658\uACBD\uBCC0\uC218',
  launchItemAuthHandshake: 'Firebase \uC778\uC99D \uC5F0\uACB0',
  launchItemCloudSync: '\uC2E4\uC2DC\uAC04 \uD074\uB77C\uC6B0\uB4DC \uBAA8\uB4DC',
  launchItemAndroidPackage: 'Android \uD328\uD0A4\uC9C0\uBA85 \uC124\uC815',
  launchItemFunctionsRegion: 'Functions \uC9C0\uC5ED \uC124\uC815',
  launchBadgeReady: '\uC644\uB8CC',
  launchBadgePending: '\uB300\uAE30',
  launchNextStep: (missingCount) =>
    missingCount <= 0
      ? '\uBE14\uB85D\uCEE4 \uC5C6\uC74C. \uBC14\uB85C \uCD9C\uC2DC \uBE4C\uB4DC \uB2E8\uACC4\uB85C \uC774\uB3D9\uD558\uC138\uC694.'
      : `\uD604\uC7AC ${missingCount}\uAC1C \uD56D\uBAA9\uC774 \uB0A8\uC544\uC788\uC2B5\uB2C8\uB2E4. env \uCC44\uC6B0\uACE0 Firebase \uC5F0\uACB0\uC744 \uB9DE\uCD94\uC138\uC694.`,
  launchExternalNote:
    '\uAC1C\uBC1C\uC790 \uACC4\uC815 \uC2B9\uC778\uACFC Play Console \uC815\uCC45 \uB2E8\uACC4\uB294 \uC571 \uBC16\uC5D0\uC11C \uC9C4\uD589\uB429\uB2C8\uB2E4.',
  superChatTestButton: '\uC288\uD37C\uCC57 \uD14C\uC2A4\uD2B8',
  subscriptionPlanTitle: '\uAD6C\uB3C5 \uB4F1\uAE09',
  subscriptionPriceHint: '\uC5B4\uC2A4 $1/\uC6D4, \uC2A4\uD398\uC774\uC2A4 $10/\uC6D4',
  subscriptionStatus: (tier) =>
    tier === 'space'
      ? '\uD604\uC7AC \uB4F1\uAE09: \uC2A4\uD398\uC774\uC2A4'
      : tier === 'earth'
        ? '\uD604\uC7AC \uB4F1\uAE09: \uC5B4\uC2A4'
        : '\uD604\uC7AC \uB4F1\uAE09: \uD504\uB9AC',
  subscriptionEarthButton: '\uC5B4\uC2A4 \uD50C\uB79C',
  subscriptionSpaceButton: '\uC2A4\uD398\uC774\uC2A4 \uD50C\uB79C',
  subscriptionFreeButton: '\uD504\uB9AC \uD50C\uB79C',
  subscriptionEarthTestButton: '\uC5B4\uC2A4 \uCCB4\uD5D8',
  subscriptionSpaceTestButton: '\uC2A4\uD398\uC774\uC2A4 \uCCB4\uD5D8',
  subscriptionFreeTestButton: '\uD504\uB9AC \uCCB4\uD5D8',
  subscriptionSpaceTag: '\uC2A4\uD398\uC774\uC2A4',
  subscriptionEarthTag: '\uC5B4\uC2A4',
  subscriptionSpacePlaceholder:
    '\uC2A4\uD398\uC774\uC2A4 \uB4F1\uAE09 \uCC44\uD305\uC774 \uC5EC\uAE30\uC5D0 \uACE0\uC815\uB429\uB2C8\uB2E4',
  subscriptionEarthPlaceholder:
    '\uC5B4\uC2A4 \uB4F1\uAE09 \uCC44\uD305\uC774 \uC5EC\uAE30\uC5D0 \uACE0\uC815\uB429\uB2C8\uB2E4',
  previewMobileButton: '\uBAA8\uBC14\uC77C \uBBF8\uB9AC\uBCF4\uAE30',
  previewDesktopButton: '\uB370\uC2A4\uD06C\uD0D1 \uBBF8\uB9AC\uBCF4\uAE30',
  superChatSlotPlaceholder: '\uC288\uD37C\uCC57 \uC0C1\uB2E8 \uC2AC\uB86F',
  superChatEarthTag: '\uC5B4\uC2A4 $1',
  superChatSpaceTag: '\uC2A4\uD398\uC774\uC2A4 $10',
  joinWithGoogleButton: 'Google로 입장',
  helperPaidLogin: '게스트 로그인은 채팅만 가능해요. Super Chat은 Google 로그인이 필요합니다.',
  searchPlaceholder: '메시지 또는 닉네임 검색',
  spamRuleNotice:
    '도배 방지: 3초 안에 5개 이상 또는 20초 안에 12개 이상 전송 시 10초 채팅 금지. 한도 2개 전에 경고가 뜨고, 3회 누적 시 1분 채팅 금지.',
  translateToggleOn: '번역 켜기',
  translateToggleOff: '번역 끄기',
  translateLanguageLabel: '번역 언어',
  translateTargetLabel: (language) => `번역 대상: ${language}`,
  translateTestModeHint:
    '로컬 번역 테스트 모드입니다. Firebase 없이 번역 결과를 시뮬레이션합니다.',
  translatedBadge: '번역됨',
  resultsShown: (filtered, total) => `${total}개 중 ${filtered}개 표시`,
  densityCompact: '촘촘히',
  densityComfortable: '넉넉히',
  perfToggle: '성능',
  jumpToLatest: (count) => `새 메시지 ${count}개 - 최신으로 이동`,
  perfFpsLabel: 'FPS',
  perfRenderLabel: '렌더',
  perfStorageLabel: '저장',
  perfBatchSizeLabel: '배치 크기',
  perfLimitLabel: '한도',
  perfModeLabel: '모드',
  perfModeLocal: '로컬',
  perfModeFirebase: 'Firebase',
  stressInjecting: '주입 중...',
  stressInjectButton: '부하 메시지 주입',
  stressLocalOnly: '스트레스 테스트는 로컬 모드에서만 가능합니다.',
  stressAdded: (count) => `스트레스 메시지 ${count}개를 추가했습니다.`,
  stressInsertFailed: '스트레스 메시지 추가에 실패했습니다.',
  paidModeGoogle: '모드: Google (채팅 + 유료)',
  paidModeGuest: '모드: 게스트 (채팅 전용)',
  googleLoginButton: 'Google 로그인',
  toastGoogleJoinNeedsFirebase:
    'Google 로그인은 Firebase 모드가 필요합니다. 지금은 게스트로 입장하세요.',
  toastJoinedWithGoogle: 'Google 계정으로 입장했습니다.',
  toastGooglePaymentConnected: 'Google 결제 로그인이 연결되었습니다.',
  toastGoogleLoginFailed: 'Google 로그인에 실패했습니다.',
  toastLocalSaveFailed: '로컬 저장에 실패했습니다.',
  toastPaymentsRequireServer: '결제는 Firebase 서버 모드가 필요합니다.',
  toastWriteMessageFirst: '먼저 메시지를 입력하세요.',
  toastRateWarning:
    '채팅 속도가 너무 빠릅니다. 계속하면 채팅 금지를 받을 수 있습니다.',
  toastPurchaseAndroidOnly: 'Super Chat 결제는 Android 앱에서만 가능합니다.',
  toastMissingAndroidPackage:
    'Android 패키지명이 없습니다. VITE_ANDROID_PACKAGE_NAME을 설정하세요.',
  toastUnknownPaidProduct: '알 수 없는 유료 상품입니다.',
  toastGoogleRequiredForPayment:
    'Super Chat 결제를 위해 Google 로그인이 필요합니다.',
  toastPurchaseCanceled: (reason) =>
    reason ? `결제가 취소되었습니다: ${reason}` : '결제가 취소되었습니다.',
  toastMissingPurchaseToken: '구매 토큰이 없습니다.',
  toastSpaceSentSuccess: 'Space Chat 전송이 완료되었습니다.',
  toastEarthSentSuccess: 'Earth Chat 전송이 완료되었습니다.',
  toastPaymentPending: '결제가 대기 중입니다.',
  toastPaymentRejected: (reason) =>
    reason ? `결제가 거절되었습니다: ${reason}` : '결제가 거절되었습니다.',
  toastPaymentVerifyFailed: '결제 검증에 실패했습니다.',
}

function withDefaultExtra(overrides: Partial<UiExtraCopy>): UiExtraCopy {
  return {
    ...EN_EXTRA,
    ...overrides,
  }
}

const JA_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Googleで参加',
  helperPaidLogin:
    'ゲストログインはチャット専用です。Super ChatにはGoogleログインが必要です。',
  searchPlaceholder: 'メッセージまたはニックネームを検索',
  resultsShown: (filtered, total) => `${total}件中 ${filtered}件表示`,
  densityCompact: 'コンパクト',
  densityComfortable: 'ゆったり',
  perfToggle: '性能',
  jumpToLatest: (count) => `新着 ${count} 件 - 最新へ移動`,
  perfRenderLabel: '描画',
  perfStorageLabel: '保存',
  perfBatchSizeLabel: 'バッチ',
  perfLimitLabel: '上限',
  perfModeLabel: 'モード',
  perfModeLocal: 'ローカル',
  stressInjecting: '挿入中...',
  stressInjectButton: '負荷メッセージ投入',
  paidModeGoogle: 'モード: Google (チャット + 有料)',
  paidModeGuest: 'モード: ゲスト (チャットのみ)',
  googleLoginButton: 'Googleログイン',
}

const FR_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Rejoindre avec Google',
  helperPaidLogin:
    "Le mode invite est reserve au chat. Super Chat requiert un login Google.",
  searchPlaceholder: 'Rechercher un message ou pseudo',
  resultsShown: (filtered, total) => `${filtered}/${total} affiches`,
  densityCompact: 'Compact',
  densityComfortable: 'Confortable',
  perfToggle: 'Perf',
  jumpToLatest: (count) => `${count} nouveaux messages - aller en bas`,
  perfRenderLabel: 'Rendu',
  perfStorageLabel: 'Stockage',
  perfBatchSizeLabel: 'Taille lot',
  perfLimitLabel: 'Limite',
  perfModeLabel: 'Mode',
  perfModeLocal: 'Local',
  stressInjecting: 'Injection...',
  stressInjectButton: 'Injecter messages de charge',
  paidModeGoogle: 'Mode: Google (chat + payant)',
  paidModeGuest: 'Mode: Invite (chat seul)',
  googleLoginButton: 'Connexion Google',
}

const ES_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Entrar con Google',
  helperPaidLogin:
    'El modo invitado es solo chat. Super Chat requiere inicio de sesion con Google.',
  searchPlaceholder: 'Buscar mensaje o apodo',
  resultsShown: (filtered, total) => `${filtered}/${total} mostrados`,
  densityCompact: 'Compacto',
  densityComfortable: 'Comodo',
  perfToggle: 'Rendimiento',
  jumpToLatest: (count) => `${count} mensajes nuevos - ir al final`,
  perfRenderLabel: 'Render',
  perfStorageLabel: 'Almacenamiento',
  perfBatchSizeLabel: 'Tamano de lote',
  perfLimitLabel: 'Limite',
  perfModeLabel: 'Modo',
  perfModeLocal: 'Local',
  stressInjecting: 'Inyectando...',
  stressInjectButton: 'Inyectar mensajes de carga',
  paidModeGoogle: 'Modo: Google (chat + pago)',
  paidModeGuest: 'Modo: Invitado (solo chat)',
  googleLoginButton: 'Login con Google',
}

const ZH_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: '使用 Google 加入',
  helperPaidLogin: '游客登录仅可聊天。Super Chat 需要 Google 登录。',
  searchPlaceholder: '搜索消息或昵称',
  resultsShown: (filtered, total) => `显示 ${filtered}/${total}`,
  densityCompact: '紧凑',
  densityComfortable: '舒适',
  perfToggle: '性能',
  jumpToLatest: (count) => `${count} 条新消息 - 跳到最新`,
  perfRenderLabel: '渲染',
  perfStorageLabel: '存储',
  perfBatchSizeLabel: '批次大小',
  perfLimitLabel: '上限',
  perfModeLabel: '模式',
  perfModeLocal: '本地',
  stressInjecting: '注入中...',
  stressInjectButton: '注入压测消息',
  paidModeGoogle: '模式: Google (聊天 + 付费)',
  paidModeGuest: '模式: 游客 (仅聊天)',
  googleLoginButton: 'Google 登录',
}

const PT_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Entrar com Google',
  helperPaidLogin:
    'Modo convidado e apenas chat. Super Chat exige login Google.',
  searchPlaceholder: 'Buscar mensagem ou apelido',
  resultsShown: (filtered, total) => `${filtered}/${total} exibidos`,
  densityCompact: 'Compacto',
  densityComfortable: 'Confortavel',
  perfToggle: 'Desempenho',
  jumpToLatest: (count) => `${count} novas mensagens - ir para o fim`,
  perfRenderLabel: 'Render',
  perfStorageLabel: 'Armazenamento',
  perfBatchSizeLabel: 'Tamanho do lote',
  perfLimitLabel: 'Limite',
  perfModeLabel: 'Modo',
  perfModeLocal: 'Local',
  stressInjecting: 'Injetando...',
  stressInjectButton: 'Injetar mensagens de carga',
  paidModeGoogle: 'Modo: Google (chat + pago)',
  paidModeGuest: 'Modo: Convidado (so chat)',
  googleLoginButton: 'Login Google',
}

const DE_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Mit Google beitreten',
  helperPaidLogin:
    'Gastmodus ist nur fuer Chat. Super Chat erfordert Google-Login.',
  searchPlaceholder: 'Nachricht oder Nickname suchen',
  resultsShown: (filtered, total) => `${filtered}/${total} angezeigt`,
  densityCompact: 'Kompakt',
  densityComfortable: 'Bequem',
  perfToggle: 'Perf',
  jumpToLatest: (count) => `${count} neue Nachrichten - nach unten`,
  perfRenderLabel: 'Render',
  perfStorageLabel: 'Speicher',
  perfBatchSizeLabel: 'Batch-Groesse',
  perfLimitLabel: 'Limit',
  perfModeLabel: 'Modus',
  perfModeLocal: 'Lokal',
  stressInjecting: 'Einspielen...',
  stressInjectButton: 'Lastnachrichten einspielen',
  paidModeGoogle: 'Modus: Google (Chat + bezahlt)',
  paidModeGuest: 'Modus: Gast (nur Chat)',
  googleLoginButton: 'Google-Login',
}

const AR_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'الانضمام عبر Google',
  helperPaidLogin: 'وضع الضيف للدردشة فقط. Super Chat يتطلب تسجيل دخول Google.',
  searchPlaceholder: 'ابحث في الرسائل أو الاسم المستعار',
  resultsShown: (filtered, total) => `عرض ${filtered}/${total}`,
  densityCompact: 'مضغوط',
  densityComfortable: 'مريح',
  perfToggle: 'الأداء',
  jumpToLatest: (count) => `${count} رسائل جديدة - الانتقال لآخر الرسائل`,
  perfRenderLabel: 'الرسم',
  perfStorageLabel: 'التخزين',
  perfBatchSizeLabel: 'حجم الدفعة',
  perfLimitLabel: 'الحد',
  perfModeLabel: 'الوضع',
  perfModeLocal: 'محلي',
  stressInjecting: 'جارٍ الإدخال...',
  stressInjectButton: 'إدخال رسائل ضغط',
  paidModeGoogle: 'الوضع: Google (دردشة + مدفوع)',
  paidModeGuest: 'الوضع: ضيف (دردشة فقط)',
  googleLoginButton: 'تسجيل دخول Google',
}

const HI_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Google से जुड़ें',
  helperPaidLogin: 'गेस्ट मोड केवल चैट के लिए है। Super Chat के लिए Google लॉगिन चाहिए।',
  searchPlaceholder: 'संदेश या निकनेम खोजें',
  resultsShown: (filtered, total) => `${filtered}/${total} दिखाए गए`,
  densityCompact: 'कॉम्पैक्ट',
  densityComfortable: 'आरामदायक',
  perfToggle: 'परफॉर्मेंस',
  jumpToLatest: (count) => `${count} नए संदेश - सबसे नीचे जाएं`,
  perfRenderLabel: 'रेंडर',
  perfStorageLabel: 'स्टोरेज',
  perfBatchSizeLabel: 'बैच आकार',
  perfLimitLabel: 'सीमा',
  perfModeLabel: 'मोड',
  perfModeLocal: 'लोकल',
  stressInjecting: 'इंजेक्ट हो रहा है...',
  stressInjectButton: 'लोड संदेश इंजेक्ट करें',
  paidModeGoogle: 'मोड: Google (चैट + पेड)',
  paidModeGuest: 'मोड: गेस्ट (केवल चैट)',
  googleLoginButton: 'Google लॉगिन',
}

const RU_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Войти через Google',
  helperPaidLogin:
    'Гостевой режим только для чата. Для Super Chat нужен вход через Google.',
  searchPlaceholder: 'Поиск по сообщению или никнейму',
  resultsShown: (filtered, total) => `Показано ${filtered}/${total}`,
  densityCompact: 'Плотно',
  densityComfortable: 'Свободно',
  perfToggle: 'Производительность',
  jumpToLatest: (count) => `${count} новых сообщений - перейти вниз`,
  perfRenderLabel: 'Рендер',
  perfStorageLabel: 'Хранилище',
  perfBatchSizeLabel: 'Размер пакета',
  perfLimitLabel: 'Лимит',
  perfModeLabel: 'Режим',
  perfModeLocal: 'Локальный',
  stressInjecting: 'Загрузка...',
  stressInjectButton: 'Добавить нагрузочные сообщения',
  paidModeGoogle: 'Режим: Google (чат + платно)',
  paidModeGuest: 'Режим: Гость (только чат)',
  googleLoginButton: 'Вход через Google',
}

const IT_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Entra con Google',
  helperPaidLogin:
    'La modalita ospite e solo chat. Super Chat richiede login Google.',
  searchPlaceholder: 'Cerca messaggio o nickname',
  resultsShown: (filtered, total) => `${filtered}/${total} mostrati`,
  densityCompact: 'Compatto',
  densityComfortable: 'Comodo',
  perfToggle: 'Prestazioni',
  jumpToLatest: (count) => `${count} nuovi messaggi - vai in fondo`,
  perfRenderLabel: 'Render',
  perfStorageLabel: 'Storage',
  perfBatchSizeLabel: 'Dimensione batch',
  perfLimitLabel: 'Limite',
  perfModeLabel: 'Modalita',
  perfModeLocal: 'Locale',
  stressInjecting: 'Iniezione...',
  stressInjectButton: 'Inietta messaggi di carico',
  paidModeGoogle: 'Modalita: Google (chat + pagamento)',
  paidModeGuest: 'Modalita: Ospite (solo chat)',
  googleLoginButton: 'Login Google',
}

const TR_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Google ile katil',
  helperPaidLogin:
    'Misafir modu sadece sohbet icin. Super Chat icin Google girisi gerekir.',
  searchPlaceholder: 'Mesaj veya takma ad ara',
  resultsShown: (filtered, total) => `${filtered}/${total} gosteriliyor`,
  densityCompact: 'Sik',
  densityComfortable: 'Rahat',
  perfToggle: 'Performans',
  jumpToLatest: (count) => `${count} yeni mesaj - en alta git`,
  perfRenderLabel: 'Render',
  perfStorageLabel: 'Depolama',
  perfBatchSizeLabel: 'Toplu boyut',
  perfLimitLabel: 'Limit',
  perfModeLabel: 'Mod',
  perfModeLocal: 'Yerel',
  stressInjecting: 'Ekleniyor...',
  stressInjectButton: 'Yuk mesajlari ekle',
  paidModeGoogle: 'Mod: Google (sohbet + odeme)',
  paidModeGuest: 'Mod: Misafir (sadece sohbet)',
  googleLoginButton: 'Google Girisi',
}

const ID_EXTRA: Partial<UiExtraCopy> = {
  joinWithGoogleButton: 'Masuk dengan Google',
  helperPaidLogin:
    'Mode tamu hanya untuk chat. Super Chat memerlukan login Google.',
  searchPlaceholder: 'Cari pesan atau nama panggilan',
  resultsShown: (filtered, total) => `${filtered}/${total} ditampilkan`,
  densityCompact: 'Ringkas',
  densityComfortable: 'Nyaman',
  perfToggle: 'Performa',
  jumpToLatest: (count) => `${count} pesan baru - lompat ke terbaru`,
  perfRenderLabel: 'Render',
  perfStorageLabel: 'Penyimpanan',
  perfBatchSizeLabel: 'Ukuran batch',
  perfLimitLabel: 'Batas',
  perfModeLabel: 'Mode',
  perfModeLocal: 'Lokal',
  stressInjecting: 'Menyuntikkan...',
  stressInjectButton: 'Suntik pesan beban',
  paidModeGoogle: 'Mode: Google (chat + berbayar)',
  paidModeGuest: 'Mode: Tamu (chat saja)',
  googleLoginButton: 'Login Google',
}

const UI_EXTRA_COPY: Record<UiLanguage, UiExtraCopy> = {
  en: EN_EXTRA,
  ko: withDefaultExtra(KO_EXTRA),
  ja: withDefaultExtra(JA_EXTRA),
  fr: withDefaultExtra(FR_EXTRA),
  es: withDefaultExtra(ES_EXTRA),
  zh: withDefaultExtra(ZH_EXTRA),
  pt: withDefaultExtra(PT_EXTRA),
  de: withDefaultExtra(DE_EXTRA),
  ar: withDefaultExtra(AR_EXTRA),
  hi: withDefaultExtra(HI_EXTRA),
  ru: withDefaultExtra(RU_EXTRA),
  it: withDefaultExtra(IT_EXTRA),
  tr: withDefaultExtra(TR_EXTRA),
  id: withDefaultExtra(ID_EXTRA),
}

export function getUiCopy(language: UiLanguage): ResolvedUiCopy {
  return {
    ...EN_COPY,
    ...EN_EXTRA,
    ...(UI_COPY[language] ?? EN_COPY),
    ...(UI_EXTRA_COPY[language] ?? {}),
  }
}

export function isUiLanguage(value: string): value is UiLanguage {
  return UI_LANGUAGES.some((language) => language.code === value)
}
