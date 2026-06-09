import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, Modal, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useApp }   from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { askAI, AIMessage } from '../../api/aiService';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface Props {
  visible:  boolean;
  onClose:  () => void;
}

export default function AIChat({ visible, onClose }: Props) {
  const { colors, lang } = useTheme();
  const { subsidiaryID, userName } = useApp();
  const { t } = useTranslation();

  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState('');
  const [typing,    setTyping]    = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const suggestions = [
    t('MD_AI_Q1'), t('MD_AI_Q2'), t('MD_AI_Q3'),
    t('MD_AI_Q4'), t('MD_AI_Q5'),
  ];

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    if (messages.length) scrollToBottom();
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || typing) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setTyping(true);

    const history: AIMessage[] = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    try {
      const resp = await askAI({ question: q, subsidiaryID, history });
      if (resp?.success && resp.answer) {
        setMessages((prev) => [...prev, { role: 'ai', content: resp.answer }]);
      } else {
        setMessages((prev) => [...prev, {
          role: 'ai',
          content: t('MD_AI_ErrorPrefix') + ' ' + (resp?.error ?? t('MD_AI_AssistantError')),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: t('MD_AI_ConnectionError') }]);
    } finally {
      setTyping(false);
    }
  };

  const isRTL = lang === 'ar';

  return (
    <>
      {/* FAB button */}
      {!visible && (
        <TouchableOpacity style={s.fab} onPress={onClose} activeOpacity={0.85}>
          <LinearGradient colors={['#8b5cf6', '#6366f1']} style={s.fabGrad}>
            <Text style={{ fontSize: 20 }}>🤖</Text>
            <Text style={s.fabText}>{t('MD_AskAssistant')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={s.backdrop} />
          <View style={[s.panel, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd }]}>

            {/* Header */}
            <LinearGradient
              colors={['rgba(139,92,246,0.15)', 'rgba(99,102,241,0.05)']}
              style={[s.panelHeader, { borderBottomColor: colors.cardBrd }]}
            >
              <View style={[s.headerTitle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <LinearGradient colors={['#8b5cf6', '#6366f1']} style={s.aiAvatar}>
                  <Text style={{ fontSize: 20 }}>🤖</Text>
                </LinearGradient>
                <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[s.aiName, { color: colors.text }]}>{t('MD_AI_Name')}</Text>
                  <View style={[s.statusRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={s.statusDot} />
                    <Text style={s.statusText}>{t('MD_AI_Connected')}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={[s.closeBtn, { borderColor: colors.cardBrd }]} onPress={onClose}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={s.body}
              contentContainerStyle={{ padding: 16, gap: 14 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Welcome */}
              {messages.length === 0 && (
                <View style={s.welcome}>
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>🤖</Text>
                  <Text style={[s.welcomeTitle, { color: colors.text }]}>
                    {t('MD_AI_Greeting')} {userName || t('MD_AI_GreetingFallback')}
                  </Text>
                  <Text style={[s.welcomeSub, { color: colors.textMuted }]}>
                    {t('MD_AI_WelcomeSub')}
                  </Text>
                  <Text style={[s.tryAsk, { color: colors.textMuted }]}>{t('MD_AI_TryAsk')}</Text>
                  <View style={{ gap: 8, width: '100%' }}>
                    {suggestions.map((q, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[s.chip, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd }]}
                        onPress={() => sendMessage(q)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.chipText, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                          {q}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <View
                    key={i}
                    style={[
                      s.msgRow,
                      { flexDirection: isUser ? (isRTL ? 'row' : 'row-reverse') : (isRTL ? 'row-reverse' : 'row') },
                    ]}
                  >
                    <View style={[s.msgAvatar, isUser ? s.userAvatar : s.aiMsgAvatar]}>
                      <Text style={{ fontSize: 14 }}>{isUser ? '👤' : '🤖'}</Text>
                    </View>
                    <View
                      style={[
                        s.bubble,
                        isUser
                          ? [s.userBubble, { backgroundColor: '#4f46e5' }]
                          : [s.aiBubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd }],
                      ]}
                    >
                      <Text
                        style={[
                          s.bubbleText,
                          { color: isUser ? '#fff' : colors.text, textAlign: isRTL ? 'right' : 'left' },
                        ]}
                      >
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Typing indicator */}
              {typing && (
                <View style={[s.msgRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[s.msgAvatar, s.aiMsgAvatar]}>
                    <Text style={{ fontSize: 14 }}>🤖</Text>
                  </View>
                  <View style={[s.bubble, s.aiBubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd }]}>
                    <View style={s.typingDots}>
                      <View style={[s.dot, { backgroundColor: colors.textMuted }]} />
                      <View style={[s.dot, { backgroundColor: colors.textMuted }]} />
                      <View style={[s.dot, { backgroundColor: colors.textMuted }]} />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={[s.inputRow, { backgroundColor: colors.bg, borderTopColor: colors.cardBrd }]}>
              <TextInput
                style={[s.textInput, { backgroundColor: colors.cardBg, borderColor: colors.cardBrd, color: colors.text }]}
                value={input}
                onChangeText={setInput}
                placeholder={t('MD_TypeQuestion')}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlign={isRTL ? 'right' : 'left'}
                editable={!typing}
                onSubmitEditing={() => sendMessage()}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[s.sendBtn, { opacity: (!input.trim() || typing) ? 0.4 : 1 }]}
                onPress={() => sendMessage()}
                disabled={!input.trim() || typing}
              >
                <LinearGradient colors={['#8b5cf6', '#6366f1']} style={s.sendGrad}>
                  <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  fab: { position: 'absolute', bottom: 24, left: 16, zIndex: 100, borderRadius: 30, overflow: 'hidden', elevation: 8 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 13 },
  fabText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1,
  },
  headerTitle:  { flex: 1, alignItems: 'center', gap: 12 },
  aiAvatar:     { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  aiName:       { fontSize: 14, fontWeight: '700' },
  statusRow:    { alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  statusText:   { fontSize: 11, color: '#22c55e' },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  body:         { flex: 1 },
  welcome:      { alignItems: 'center', paddingVertical: 20 },
  welcomeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  welcomeSub:   { fontSize: 12, lineHeight: 20, textAlign: 'center', marginBottom: 20 },
  tryAsk:       { fontSize: 11, marginBottom: 10 },
  chip: {
    width: '100%', borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  chipText:     { fontSize: 12 },

  msgRow:       { alignItems: 'flex-start', gap: 10 },
  msgAvatar:    { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  userAvatar:   { backgroundColor: '#4f46e5' },
  aiMsgAvatar:  { backgroundColor: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
  bubble:       { maxWidth: '80%', padding: 12, borderRadius: 14 },
  userBubble:   { borderBottomRightRadius: 4 },
  aiBubble:     { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText:   { fontSize: 13, lineHeight: 20 },

  typingDots:   { flexDirection: 'row', gap: 4, padding: 4 },
  dot:          { width: 7, height: 7, borderRadius: 4 },

  inputRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderTopWidth: 1 },
  textInput:    { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, maxHeight: 100 },
  sendBtn:      { flexShrink: 0 },
  sendGrad:     { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
});
