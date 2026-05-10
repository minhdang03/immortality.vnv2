/**
 * use-pha-no-le-logs — TanStack Query hooks for Phá Nô Lệ Trí Tuệ practice logs.
 *
 * All log entries are encrypted client-side (AES-GCM) before upload.
 * Server stores ciphertext + iv only — never sees plaintext.
 *
 * usePhaNoleLogs(chuNo): list of decrypted entries for a given chủ nô
 * useCreatePhaNoLeLog(): mutation that encrypts then POSTs
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';
import { apiClient, ApiError } from '../services/api-client';
import {
  encryptEntry,
  decryptEntry,
  EncryptedPayload,
} from '../features/pha-no-le/lib/journal-crypto';
import type { ChuNo } from './use-profile';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PhaNoLeLogEntry {
  id: string;
  chuNo: ChuNo;
  plaintext: string; // decrypted on client; NEVER sent to server
  createdAt: string; // ISO
}

interface RawLogEntry {
  id: string;
  chuNo: ChuNo;
  ciphertext: string; // base64
  iv: string; // base64
  createdAt: string;
}

export interface CreateLogPayload {
  chuNo: ChuNo;
  plaintext: string;
}

// ── Query keys ────────────────────────────────────────────────────────────

const logsKey = (chuNo: ChuNo) => ['pha-no-le-logs', chuNo] as const;

// ── usePhaNoleLogs ─────────────────────────────────────────────────────────

export function usePhaNoleLogs(chuNo: ChuNo) {
  const uid = useAuthStore((s) => s.uid);

  return useQuery<PhaNoLeLogEntry[], Error>({
    queryKey: logsKey(chuNo),
    queryFn: async () => {
      if (!uid) return [];
      try {
        const raw = await apiClient.get<RawLogEntry[]>(
          `/api/practice-logs/me?chuNo=${encodeURIComponent(chuNo)}`,
        );
        // Decrypt each entry; keep entries that fail decryption with placeholder
        const decrypted: PhaNoLeLogEntry[] = [];
        for (const entry of raw) {
          try {
            const plaintext = await decryptEntry({ ciphertext: entry.ciphertext, iv: entry.iv });
            decrypted.push({ id: entry.id, chuNo: entry.chuNo, plaintext, createdAt: entry.createdAt });
          } catch {
            // Key mismatch (reinstall scenario) — show placeholder
            decrypted.push({
              id: entry.id,
              chuNo: entry.chuNo,
              plaintext: '[Không giải mã được — key thiết bị không khớp]',
              createdAt: entry.createdAt,
            });
          }
        }
        return decrypted;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return [];
        throw err;
      }
    },
    enabled: !!uid,
    staleTime: 60 * 1000,
  });
}

// ── useCreatePhaNoLeLog ───────────────────────────────────────────────────

export function useCreatePhaNoLeLog() {
  const qc = useQueryClient();

  return useMutation<{ id: string; createdAt: string }, Error, CreateLogPayload>({
    mutationFn: async ({ chuNo, plaintext }) => {
      const encrypted: EncryptedPayload = await encryptEntry(plaintext);
      return apiClient.post<{ id: string; createdAt: string }>('/api/practice-logs', {
        chuNo,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
      });
    },
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: logsKey(variables.chuNo) });
    },
  });
}
