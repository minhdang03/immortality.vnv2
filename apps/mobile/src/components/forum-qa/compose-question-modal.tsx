/**
 * ComposeQuestionModal — pageSheet modal for posting a new question.
 * Fields: title + body + truc picker (1/2/3) + depthTag picker (🌱/🌿/🌳).
 * Depth tag = CONTENT classification, NOT user level — label copy enforces this.
 * Body cap: 4096 chars (matches server limit). Title cap: 200 chars.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, fontSizes, radii, spacing } from '../../theme';
import type { DepthTag, Truc } from '@btd/shared';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; body: string; truc: Truc; depthTag: DepthTag }) => Promise<void>;
  prefillTitle?: string;
}

const TRUC_OPTS: { value: Truc; label: string; desc: string }[] = [
  { value: 1, label: 'Trục 1', desc: 'Cơ thể vật lý' },
  { value: 2, label: 'Trục 2', desc: 'Linh hồn / tâm linh' },
  { value: 3, label: 'Trục 3', desc: 'Phá nô lệ tư duy' },
];

const DEPTH_OPTS: { value: DepthTag; label: string; desc: string }[] = [
  { value: 'co-ban',   label: '🌱 Cơ bản',  desc: 'Câu hỏi nhập môn, khái niệm cơ bản' },
  { value: 'di-sau',   label: '🌿 Đi sâu',  desc: 'Câu hỏi phân tích, cơ chế cụ thể' },
  { value: 'nang-cao', label: '🌳 Nâng cao', desc: 'Câu hỏi phức tạp, góc nhìn nâng cao' },
];

export function ComposeQuestionModal({ visible, onClose, onSubmit, prefillTitle }: Props) {
  const [title, setTitle] = useState(prefillTitle ?? '');
  const [body, setBody] = useState('');
  const [truc, setTruc] = useState<Truc>(1);
  const [depthTag, setDepthTag] = useState<DepthTag>('co-ban');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (prefillTitle) setTitle(prefillTitle); }, [prefillTitle]);

  const handleClose = useCallback(() => { if (!submitting) onClose(); }, [submitting, onClose]);

  const handleSubmit = useCallback(async () => {
    const t = title.trim(); const b = body.trim();
    if (t.length < 5) { setError('Tiêu đề cần ít nhất 5 ký tự.'); return; }
    if (b.length < 10) { setError('Nội dung cần ít nhất 10 ký tự.'); return; }
    setError(null); setSubmitting(true);
    try {
      await onSubmit({ title: t, body: b, truc, depthTag });
      setTitle(''); setBody(''); setTruc(1); setDepthTag('co-ban');
      onClose();
    } catch { setError('Không thể đăng câu hỏi. Thử lại sau.'); }
    finally { setSubmitting(false); }
  }, [title, body, truc, depthTag, onSubmit, onClose]);

  const canSubmit = title.trim().length >= 5 && body.trim().length >= 10 && !submitting;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} disabled={submitting} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Huỷ</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đặt câu hỏi mới</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit}
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}>
              {submitting
                ? <ActivityIndicator size="small" color="#fdf6e6" />
                : <Text style={styles.submitText}>Đăng</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

            <Text style={styles.label}>Tiêu đề câu hỏi *</Text>
            <TextInput style={styles.titleInput} value={title} onChangeText={(v) => setTitle(v.slice(0, 200))}
              placeholder="Câu hỏi của bạn là gì?" placeholderTextColor={colors.inkMuted}
              multiline accessibilityLabel="Tiêu đề câu hỏi" />
            <Text style={styles.charCount}>{title.length}/200</Text>

            <Text style={styles.label}>Mô tả chi tiết *</Text>
            <TextInput style={styles.bodyInput} value={body} onChangeText={(v) => setBody(v.slice(0, 4096))}
              placeholder="Cung cấp bối cảnh, dữ liệu đo được, những gì bạn đã thử..."
              placeholderTextColor={colors.inkMuted} multiline textAlignVertical="top"
              accessibilityLabel="Nội dung câu hỏi" />
            <Text style={styles.charCount}>{body.length}/4096</Text>

            <Text style={styles.label}>Trục chủ đề *</Text>
            <View style={styles.row}>
              {TRUC_OPTS.map((o) => (
                <TouchableOpacity key={o.value} style={[styles.pickerChip, truc === o.value && styles.pickerChipActive]}
                  onPress={() => setTruc(o.value)} accessibilityRole="radio" accessibilityState={{ selected: truc === o.value }}>
                  <Text style={[styles.pcLabel, truc === o.value && styles.pcLabelActive]}>{o.label}</Text>
                  <Text style={[styles.pcDesc, truc === o.value && styles.pcDescActive]}>{o.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Độ sâu nội dung *</Text>
            <Text style={styles.hint}>Đây là mức độ của CÂU HỎI, không phải trình độ của bạn.</Text>
            <View style={styles.col}>
              {DEPTH_OPTS.map((o) => (
                <TouchableOpacity key={o.value} style={[styles.depthChip, depthTag === o.value && styles.depthChipActive]}
                  onPress={() => setDepthTag(o.value)} accessibilityRole="radio" accessibilityState={{ selected: depthTag === o.value }}>
                  <Text style={[styles.dcLabel, depthTag === o.value && styles.dcLabelActive]}>{o.label}</Text>
                  <Text style={[styles.dcDesc, depthTag === o.value && styles.dcDescActive]}>{o.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.rule,
  },
  cancelBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  cancelText: { fontFamily: typography.sans, fontSize: fontSizes.base, color: colors.inkMuted },
  headerTitle: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.base, color: colors.ink },
  submitBtn: { backgroundColor: colors.goldDeep, paddingHorizontal: spacing[4], paddingVertical: 7, borderRadius: radii.pill, minWidth: 52, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: '#fdf6e6' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing[4], paddingBottom: spacing[12] },
  errorBox: { backgroundColor: 'rgba(200,50,50,0.08)', borderRadius: radii.sm, padding: spacing[3], marginBottom: spacing[3] },
  errorText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: '#c83232' },
  label: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: colors.ink, marginBottom: 6, marginTop: spacing[4] },
  hint: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, fontStyle: 'italic', marginBottom: 8, marginTop: -4 },
  charCount: { fontFamily: typography.mono, fontSize: fontSizes.xs - 1, color: colors.inkMuted, textAlign: 'right', marginTop: 4 },
  titleInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.sm, padding: spacing[3], fontFamily: typography.sans, fontSize: fontSizes.base, color: colors.ink, minHeight: 60 },
  bodyInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.sm, padding: spacing[3], fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.ink, minHeight: 120 },
  row: { flexDirection: 'row', gap: spacing[2] },
  pickerChip: { flex: 1, padding: spacing[3], backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.sm },
  pickerChipActive: { backgroundColor: colors.goldTint, borderColor: colors.goldSoft },
  pcLabel: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.xs + 1, color: colors.inkMuted, marginBottom: 2 },
  pcLabelActive: { color: colors.goldDeep },
  pcDesc: { fontFamily: typography.sans, fontSize: fontSizes.xs - 1, color: colors.inkMuted, lineHeight: 14 },
  pcDescActive: { color: colors.goldDeep },
  col: { gap: spacing[2] },
  depthChip: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3], backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.sm },
  depthChipActive: { backgroundColor: colors.goldTint, borderColor: colors.goldSoft },
  dcLabel: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: colors.inkMuted, width: 100 },
  dcLabelActive: { color: colors.goldDeep },
  dcDesc: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, flex: 1 },
  dcDescActive: { color: colors.goldDeep },
});
