/**
 * ChuNoEncryptedJournalLogScreen — encrypted personal journal for one chủ nô.
 *
 * Lists decrypted entries (newest first). Composer at bottom for new entries.
 * All entries are AES-GCM encrypted client-side before upload; server stores ciphertext+iv only.
 *
 * Reinstall warning: shown via Alert when no key exists in SecureStore and user
 * tries to write their first entry — new key will be generated, old entries unreadable.
 *
 * Route: ChuNoLog — { chuNo: ChuNo }
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { usePhaNoleLogs, useCreatePhaNoLeLog, PhaNoLeLogEntry } from '../../../hooks/use-pha-no-le-logs';
import { hasEncryptionKey } from '../../../features/pha-no-le/lib/journal-crypto';
import { colors, typography, fontSizes, spacing, radii, shadows } from '../../../theme';
import type { ChuNo } from '../../../hooks/use-profile';

// ── Date formatting ───────────────────────────────────────────────────────────

function formatEntryDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return iso.slice(0, 10);
  }
}

// ── Entry item ────────────────────────────────────────────────────────────────

function JournalEntryItem({ entry }: { entry: PhaNoLeLogEntry }) {
  const isDecryptionError = entry.plaintext.startsWith('[Không giải mã được');
  return (
    <View style={entryStyles.card}>
      <Text style={entryStyles.date}>{formatEntryDate(entry.createdAt)}</Text>
      <Text
        style={[entryStyles.text, isDecryptionError && entryStyles.errorText]}
      >
        {entry.plaintext}
      </Text>
    </View>
  );
}

const entryStyles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: spacing[4],
    ...shadows.card,
  },
  date: {
    fontFamily: typography.mono,
    fontSize: fontSizes.xs,
    color: colors.goldDeep,
    marginBottom: spacing[1],
    fontWeight: '600',
  },
  text: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
    lineHeight: fontSizes.sm * 1.55,
  },
  errorText: {
    color: colors.inkMuted,
    fontStyle: 'italic',
  },
});

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyJournal({ prompt }: { prompt: string }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.prompt}>{prompt}</Text>
      <Text style={emptyStyles.hint}>Chưa có entry nào. Viết entry đầu tiên bên dưới.</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  prompt: {
    fontFamily: typography.serif,
    fontSize: fontSizes.base,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: fontSizes.base * 1.55,
    marginBottom: spacing[4],
  },
  hint: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});

// ── Composer ──────────────────────────────────────────────────────────────────

interface ComposerProps {
  chuNo: ChuNo;
  onSubmitSuccess: () => void;
}

function JournalComposer({ chuNo, onSubmitSuccess }: ComposerProps) {
  const [text, setText] = useState('');
  const createLog = useCreatePhaNoLeLog();
  const warnedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || createLog.isPending) return;

    // Warn on first write attempt if no key exists yet
    if (!warnedRef.current) {
      const keyExists = await hasEncryptionKey();
      if (!keyExists) {
        warnedRef.current = true;
        Alert.alert(
          'Key mã hoá mới',
          'Entry sẽ được mã hoá bằng key mới trên thiết bị này. Nếu bạn cài lại app sau này, các entry này sẽ không đọc được.',
          [
            { text: 'Huỷ', style: 'cancel' },
            {
              text: 'Tiếp tục ghi',
              style: 'default',
              onPress: () => submitEntry(trimmed),
            },
          ],
        );
        return;
      }
    }

    await submitEntry(trimmed);
  }, [text, createLog.isPending]);

  const submitEntry = useCallback(async (content: string) => {
    try {
      await createLog.mutateAsync({ chuNo, plaintext: content });
      setText('');
      onSubmitSuccess();
    } catch {
      Alert.alert('Lỗi lưu', 'Không lưu được entry. Thử lại sau.');
    }
  }, [chuNo, createLog, onSubmitSuccess]);

  return (
    <View style={composerStyles.container}>
      <TextInput
        style={composerStyles.input}
        value={text}
        onChangeText={setText}
        placeholder="Viết suy nghĩ hôm nay…"
        placeholderTextColor={colors.inkMuted}
        multiline
        maxLength={2000}
        returnKeyType="default"
      />
      <TouchableOpacity
        style={[composerStyles.sendBtn, (!text.trim() || createLog.isPending) && composerStyles.sendBtnDisabled]}
        onPress={handleSubmit}
        disabled={!text.trim() || createLog.isPending}
        accessibilityRole="button"
        accessibilityLabel="Lưu entry"
      >
        {createLog.isPending ? (
          <ActivityIndicator color="#fdf6e6" size="small" />
        ) : (
          <Text style={composerStyles.sendText}>Lưu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const composerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    backgroundColor: colors.bg,
    gap: spacing[2],
  },
  input: {
    flex: 1,
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2] + 2,
    backgroundColor: colors.surface,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: colors.goldDeep,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2] + 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendText: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: '#fdf6e6' },
});

// ── CHU_NO prompts (mirror of ChuNoCard config, kept local for screen context) ──

const CHU_NO_PROMPTS: Record<ChuNo, string> = {
  'thieu-hieu-biet': 'Hôm nay học được gì mới mà phá 1 quan niệm cũ?',
  'ong-ba-lac-hau': 'Định kiến gia truyền nào cần xét lại?',
  'dinh-kien': 'Niềm tin nào formed lúc 5–15 tuổi mà tôi chưa từng xét?',
  'chu-no-giau-mat': 'Tôn giáo, gurus, MLM coach — ai đang xài não tôi?',
};

// ── Screen ─────────────────────────────────────────────────────────────────────

export function ChuNoEncryptedJournalLogScreen() {
  const route = useRoute();
  const { chuNo } = route.params as { chuNo: ChuNo };
  const listRef = useRef<FlatList>(null);

  const { data: entries = [], isLoading, isError, refetch } = usePhaNoleLogs(chuNo);

  // Newest first
  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleSubmitSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const prompt = CHU_NO_PROMPTS[chuNo];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.goldDeep} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Không tải được nhật ký. Thử lại sau.</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JournalEntryItem entry={item} />}
          ListEmptyComponent={<EmptyJournal prompt={prompt} />}
          ListHeaderComponent={
            sorted.length > 0 ? (
              <Text style={styles.promptBanner}>{prompt}</Text>
            ) : null
          }
          contentContainerStyle={sorted.length === 0 ? styles.emptyContent : styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <JournalComposer chuNo={chuNo} onSubmitSuccess={handleSubmitSuccess} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContent: { flexGrow: 1 },
  listContent: { paddingTop: spacing[4], paddingBottom: spacing[4] },
  promptBanner: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    fontStyle: 'italic',
    lineHeight: fontSizes.sm * 1.5,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: fontSizes.sm,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: spacing[6],
  },
});
