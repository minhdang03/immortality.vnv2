/**
 * Tests: auth-store Zustand state transitions.
 */
import { useAuthStore } from '../src/stores/auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      uid: null,
      isAuthed: false,
      isHydrating: true,
      nickname: null,
    });
  });

  it('starts with hydrating=true, isAuthed=false', () => {
    const state = useAuthStore.getState();
    expect(state.isHydrating).toBe(true);
    expect(state.isAuthed).toBe(false);
    expect(state.uid).toBeNull();
  });

  it('setUser sets uid, isAuthed=true, isHydrating=false', () => {
    useAuthStore.getState().setUser('uid-123', 'Minh');
    const state = useAuthStore.getState();
    expect(state.uid).toBe('uid-123');
    expect(state.isAuthed).toBe(true);
    expect(state.isHydrating).toBe(false);
    expect(state.nickname).toBe('Minh');
  });

  it('setUser without nickname sets nickname=null', () => {
    useAuthStore.getState().setUser('uid-456');
    expect(useAuthStore.getState().nickname).toBeNull();
  });

  it('clearUser resets all auth state', () => {
    useAuthStore.getState().setUser('uid-789', 'Test');
    useAuthStore.getState().clearUser();
    const state = useAuthStore.getState();
    expect(state.uid).toBeNull();
    expect(state.isAuthed).toBe(false);
    expect(state.isHydrating).toBe(false);
    expect(state.nickname).toBeNull();
  });

  it('setHydrating updates hydrating flag', () => {
    useAuthStore.getState().setHydrating(false);
    expect(useAuthStore.getState().isHydrating).toBe(false);
  });
});
