/**
 * BayCungEditOwnProfileScreen — edit nickname, profile photo (R2 upload), and practice focus.
 *
 * Flow:
 *   1. Nickname text input (max 40 chars).
 *   2. Photo picker → POST /api/profiles/me/photo-upload-url → signed PUT to R2 → PATCH profile.
 *   3. Focus picker: chuNo selector + technique text + capLuyenPct slider (0–100).
 *
 * Route: BayCungEditProfile (no params)
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useMyProfile, useUpdateFocus, ChuNo } from '../../../hooks/use-profile';
import { apiClient } from '../../../services/api-client';
import { colors, typography, fontSizes, spacing, radii, shadows } from '../../../theme';

// ── ChuNo picker options ──────────────────────────────────────────────────────

const CHU_NO_OPTIONS: { value: ChuNo; label: string }[] = [
  { value: 'thieu-hieu-biet', label: 'Thiếu hiểu biết' },
  { value: 'ong-ba-lac-hau', label: 'Ông bà lạc hậu' },
  { value: 'dinh-kien', label: 'Định kiến từ bé' },
  { value: 'chu-no-giau-mat', label: 'Chủ nô giấu mặt' },
];

// ── SliderRow — manual step slider using +/- buttons (no native Slider needed) ──

function CapLuyenSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={sliderStyles.row}>
      <TouchableOpacity
        onPress={() => onChange(Math.max(0, value - 5))}
        style={sliderStyles.btn}
        accessibilityLabel="Giảm 5%"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={sliderStyles.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={sliderStyles.val}>{value}%</Text>
      <TouchableOpacity
        onPress={() => onChange(Math.min(100, value + 5))}
        style={sliderStyles.btn}
        accessibilityLabel="Tăng 5%"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={sliderStyles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  btn: {
    width: 36, height: 36, borderRadius: radii.sm,
    backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: typography.sansBold, fontSize: fontSizes.md, color: colors.goldDeep },
  val: { fontFamily: typography.mono, fontSize: fontSizes.md, color: colors.ink, minWidth: 52, textAlign: 'center' },
});

// ── FieldLabel ────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function BayCungEditOwnProfileScreen() {
  const navigation = useNavigation();
  const { data: profile, refetch } = useMyProfile();
  const updateFocus = useUpdateFocus();

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(profile?.photoUrl ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedChuNo, setSelectedChuNo] = useState<ChuNo>(
    profile?.currentFocus?.chuNo ?? 'thieu-hieu-biet',
  );
  const [technique, setTechnique] = useState(profile?.currentFocus?.technique ?? '');
  const [capLuyenPct, setCapLuyenPct] = useState(profile?.currentFocus?.capLuyenPct ?? 0);
  const [saving, setSaving] = useState(false);

  // ── Photo picker + R2 upload ──────────────────────────────────────────────

  const handlePickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploadingPhoto(true);
    try {
      // Step 1: get signed PUT URL from API
      const { uploadUrl, publicUrl } = await apiClient.post<{
        uploadUrl: string;
        publicUrl: string;
      }>('/api/profiles/me/photo-upload-url', {
        contentType: asset.mimeType ?? 'image/jpeg',
      });

      // Step 2: PUT file to R2
      const blob = await (await fetch(asset.uri)).blob();
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': asset.mimeType ?? 'image/jpeg' },
      });
      if (!uploadRes.ok) throw new Error(`R2 upload failed: ${uploadRes.status}`);

      // Step 3: PATCH profile to store publicUrl
      await apiClient.patch('/api/profiles/me', { photoUrl: publicUrl });
      setPhotoUri(publicUrl);
      await refetch();
    } catch (err) {
      Alert.alert('Lỗi tải ảnh', 'Không tải được ảnh lên. Thử lại sau.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [refetch]);

  // ── Save nickname + focus ─────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (saving) return;
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length === 0) {
      Alert.alert('Thiếu tên', 'Nickname không được để trống.');
      return;
    }
    if (trimmedNickname.length > 40) {
      Alert.alert('Tên quá dài', 'Nickname tối đa 40 ký tự.');
      return;
    }

    setSaving(true);
    try {
      // Save nickname
      await apiClient.patch('/api/profiles/me', { nickname: trimmedNickname });
      // Save focus
      await updateFocus.mutateAsync({
        chuNo: selectedChuNo,
        technique: technique.trim(),
        capLuyenPct,
      });
      await refetch();
      navigation.goBack();
    } catch {
      Alert.alert('Lỗi lưu', 'Không lưu được thay đổi. Thử lại sau.');
    } finally {
      setSaving(false);
    }
  }, [saving, nickname, selectedChuNo, technique, capLuyenPct, updateFocus, refetch, navigation]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Profile photo */}
      <View style={styles.photoSection}>
        <TouchableOpacity
          onPress={handlePickPhoto}
          disabled={uploadingPhoto}
          accessibilityRole="button"
          accessibilityLabel="Đổi ảnh đại diện"
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Chọn ảnh</Text>
            </View>
          )}
          {uploadingPhoto && (
            <View style={styles.photoOverlay}>
              <ActivityIndicator color={colors.goldDeep} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.photoHint}>Chạm để đổi ảnh đại diện</Text>
      </View>

      {/* Nickname */}
      <View style={styles.field}>
        <FieldLabel>Nickname</FieldLabel>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={(t) => setNickname(t.slice(0, 40))}
          placeholder="Tên hiển thị của bạn"
          placeholderTextColor={colors.inkMuted}
          maxLength={40}
          autoCapitalize="none"
          returnKeyType="done"
        />
        <Text style={styles.charCount}>{nickname.trim().length}/40</Text>
      </View>

      {/* Chủ nô selector */}
      <View style={styles.field}>
        <FieldLabel>Đang phá chủ nô nào?</FieldLabel>
        <View style={styles.chuNoGrid}>
          {CHU_NO_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chuNoChip, selectedChuNo === opt.value && styles.chuNoChipActive]}
              onPress={() => setSelectedChuNo(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedChuNo === opt.value }}
            >
              <Text
                style={[styles.chuNoChipText, selectedChuNo === opt.value && styles.chuNoChipTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Technique */}
      <View style={styles.field}>
        <FieldLabel>Kỹ thuật đang luyện</FieldLabel>
        <TextInput
          style={styles.input}
          value={technique}
          onChangeText={(t) => setTechnique(t.slice(0, 80))}
          placeholder="VD: Thái Dương Quyền cấp 1 bài 3"
          placeholderTextColor={colors.inkMuted}
          maxLength={80}
          returnKeyType="done"
        />
      </View>

      {/* Cấp luyện % */}
      <View style={styles.field}>
        <FieldLabel>Tiến độ cấp 1 (30 ngày)</FieldLabel>
        <CapLuyenSlider value={capLuyenPct} onChange={setCapLuyenPct} />
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Lưu thay đổi"
      >
        {saving ? (
          <ActivityIndicator color="#fdf6e6" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>Lưu</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[5] },
  photoSection: { alignItems: 'center', marginBottom: spacing[5] },
  photo: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.goldSoft },
  photoPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderText: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.goldDeep },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: { fontFamily: typography.sans, fontSize: fontSizes.xs, color: colors.inkMuted, marginTop: spacing[2] },
  field: { marginBottom: spacing[5] },
  fieldLabel: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.sm, color: colors.ink, marginBottom: spacing[2] },
  input: {
    fontFamily: typography.sans, fontSize: fontSizes.base, color: colors.ink,
    borderWidth: 1, borderColor: colors.rule, borderRadius: radii.sm,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2] + 2,
    backgroundColor: colors.surface,
  },
  charCount: { fontFamily: typography.mono, fontSize: fontSizes.xs, color: colors.inkMuted, textAlign: 'right', marginTop: 4 },
  chuNoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chuNoChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radii.pill, borderWidth: 1, borderColor: colors.rule,
    backgroundColor: colors.surface,
  },
  chuNoChipActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldDeep },
  chuNoChipText: { fontFamily: typography.sans, fontSize: fontSizes.sm, color: colors.inkSoft },
  chuNoChipTextActive: { color: colors.goldDeep, fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.goldDeep, borderRadius: radii.sm,
    paddingVertical: spacing[3], alignItems: 'center', ...shadows.card,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontFamily: typography.sansSemiBold, fontSize: fontSizes.base, color: '#fdf6e6' },
  bottomPad: { height: spacing[8] },
});
