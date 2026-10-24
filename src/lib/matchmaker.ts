import { randomUUID } from 'crypto';
import { createOneOnOneToken, getLiveKitUrl } from './livekit';
import { generateParticipantIdentity } from './identity';

export type Gender = 'male' | 'female';
export type TargetGender = 'any' | 'female';

export interface QueueUser {
  peerId: string;
  displayName: string;
  gender: Gender;
  isPremium: boolean;
  targetGender: TargetGender;
  previousPeerId?: string;
  enteredAt: number;
  lastSeenAt: number;
}

export interface MatchParticipant {
  peerId: string;
  displayName: string;
  gender: Gender;
  identity: string;
  token: string;
}

export interface ActiveMatch {
  matchId: string;
  roomName: string;
  matchedAt: number;
  userA: MatchParticipant;
  userB: MatchParticipant;
  partnerSkippedBy?: string; // peerId of whoever pressed skip
}

interface MatchmakerStore {
  waitingQueue: Map<string, QueueUser>;
  activeMatches: Map<string, ActiveMatch>; // mapped by peerId -> ActiveMatch
  lastCleanedAt: number;
}

declare global {
  var __stationtalk_matchmaker: MatchmakerStore | undefined;
}

function getStore(): MatchmakerStore {
  if (!globalThis.__stationtalk_matchmaker) {
    globalThis.__stationtalk_matchmaker = {
      waitingQueue: new Map(),
      activeMatches: new Map(),
      lastCleanedAt: Date.now(),
    };
  }
  return globalThis.__stationtalk_matchmaker;
}

function cleanupStaleEntries(store: MatchmakerStore) {
  const now = Date.now();
  // Clean up at most once every 5 seconds
  if (now - store.lastCleanedAt < 5000) return;
  store.lastCleanedAt = now;

  // Evict waiting users who haven't polled in 25 seconds
  for (const [peerId, user] of store.waitingQueue.entries()) {
    if (now - user.lastSeenAt > 25000) {
      store.waitingQueue.delete(peerId);
    }
  }

  // Evict matches older than 15 minutes
  for (const [peerId, match] of store.activeMatches.entries()) {
    if (now - match.matchedAt > 15 * 60 * 1000) {
      store.activeMatches.delete(peerId);
    }
  }
}

/** Check if two users are compatible for matching based on their preferences */
function areCompatible(a: QueueUser, b: QueueUser): boolean {
  if (a.peerId === b.peerId) return false;

  // Check target preferences
  if (a.targetGender === 'female' && b.gender !== 'female') {
    return false;
  }
  if (b.targetGender === 'female' && a.gender !== 'female') {
    return false;
  }

  return true;
}

export async function joinOrFindMatch(user: {
  peerId: string;
  displayName: string;
  gender: Gender;
  isPremium: boolean;
  targetGender: TargetGender;
  previousPeerId?: string;
}): Promise<
  | { status: 'matched'; roomName: string; token: string; partner: { name: string; gender: Gender }; livekitUrl: string }
  | { status: 'waiting'; queueSize: number }
> {
  const store = getStore();
  cleanupStaleEntries(store);

  // If user already has an active, non-skipped match, return it
  const existingMatch = store.activeMatches.get(user.peerId);
  if (existingMatch && !existingMatch.partnerSkippedBy) {
    const isUserA = existingMatch.userA.peerId === user.peerId;
    const current = isUserA ? existingMatch.userA : existingMatch.userB;
    const partner = isUserA ? existingMatch.userB : existingMatch.userA;
    return {
      status: 'matched',
      roomName: existingMatch.roomName,
      token: current.token,
      partner: {
        name: partner.displayName,
        gender: partner.gender,
      },
      livekitUrl: getLiveKitUrl(),
    };
  }

  // Remove any stale match for this user
  store.activeMatches.delete(user.peerId);

  const currentUser: QueueUser = {
    ...user,
    enteredAt: Date.now(),
    lastSeenAt: Date.now(),
  };

  // Search queue for a compatible partner
  // Priority 1: Check if any waiting user with Premium target match is waiting
  // Priority 2: Standard FIFO matching
  let candidatePeerId: string | null = null;
  let fallbackCandidatePeerId: string | null = null;

  // First pass: give priority to premium users waiting in queue
  for (const [waitingPeerId, waitingUser] of store.waitingQueue.entries()) {
    if (waitingUser.isPremium && areCompatible(currentUser, waitingUser)) {
      if (user.previousPeerId && waitingPeerId === user.previousPeerId) {
        fallbackCandidatePeerId = waitingPeerId;
      } else {
        candidatePeerId = waitingPeerId;
        break;
      }
    }
  }

  // Second pass: standard FIFO for any compatible user
  if (!candidatePeerId) {
    for (const [waitingPeerId, waitingUser] of store.waitingQueue.entries()) {
      if (areCompatible(currentUser, waitingUser)) {
        if (user.previousPeerId && waitingPeerId === user.previousPeerId) {
          fallbackCandidatePeerId = waitingPeerId;
        } else {
          candidatePeerId = waitingPeerId;
          break;
        }
      }
    }
  }

  const selectedPeerId = candidatePeerId || fallbackCandidatePeerId;

  if (selectedPeerId) {
    const waitingUser = store.waitingQueue.get(selectedPeerId)!;
    store.waitingQueue.delete(selectedPeerId);
    store.waitingQueue.delete(user.peerId);

    const roomName = `pvt-${randomUUID().slice(0, 8)}`;
    const identityA = generateParticipantIdentity();
    const identityB = generateParticipantIdentity();

    const [tokenA, tokenB] = await Promise.all([
      createOneOnOneToken({
        roomName,
        participantIdentity: identityA,
        participantName: currentUser.displayName,
      }),
      createOneOnOneToken({
        roomName,
        participantIdentity: identityB,
        participantName: waitingUser.displayName,
      }),
    ]);

    const activeMatch: ActiveMatch = {
      matchId: randomUUID(),
      roomName,
      matchedAt: Date.now(),
      userA: {
        peerId: currentUser.peerId,
        displayName: currentUser.displayName,
        gender: currentUser.gender,
        identity: identityA,
        token: tokenA,
      },
      userB: {
        peerId: waitingUser.peerId,
        displayName: waitingUser.displayName,
        gender: waitingUser.gender,
        identity: identityB,
        token: tokenB,
      },
    };

    store.activeMatches.set(currentUser.peerId, activeMatch);
    store.activeMatches.set(waitingUser.peerId, activeMatch);

    return {
      status: 'matched',
      roomName,
      token: tokenA,
      partner: {
        name: waitingUser.displayName,
        gender: waitingUser.gender,
      },
      livekitUrl: getLiveKitUrl(),
    };
  }

  // No match found yet, enqueue user
  store.waitingQueue.set(user.peerId, currentUser);

  return {
    status: 'waiting',
    queueSize: store.waitingQueue.size,
  };
}

export function pollMatchStatus(peerId: string):
  | { status: 'matched'; roomName: string; token: string; partner: { name: string; gender: Gender }; livekitUrl: string }
  | { status: 'partner_skipped'; previousPartnerName?: string }
  | { status: 'waiting'; queueSize: number }
  | { status: 'idle' } {
  const store = getStore();
  cleanupStaleEntries(store);

  // Check active match
  const match = store.activeMatches.get(peerId);
  if (match) {
    if (match.partnerSkippedBy && match.partnerSkippedBy !== peerId) {
      const isUserA = match.userA.peerId === peerId;
      const partner = isUserA ? match.userB : match.userA;
      // Partner skipped, remove match from map for this user so they can re-queue
      store.activeMatches.delete(peerId);
      return {
        status: 'partner_skipped',
        previousPartnerName: partner.displayName,
      };
    }

    const isUserA = match.userA.peerId === peerId;
    const current = isUserA ? match.userA : match.userB;
    const partner = isUserA ? match.userB : match.userA;

    return {
      status: 'matched',
      roomName: match.roomName,
      token: current.token,
      partner: {
        name: partner.displayName,
        gender: partner.gender,
      },
      livekitUrl: getLiveKitUrl(),
    };
  }

  // Check waiting queue
  const waitingUser = store.waitingQueue.get(peerId);
  if (waitingUser) {
    waitingUser.lastSeenAt = Date.now();
    return {
      status: 'waiting',
      queueSize: store.waitingQueue.size,
    };
  }

  return { status: 'idle' };
}

export async function skipCurrentMatch(
  peerId: string,
  userInfo: { displayName: string; gender: Gender; isPremium: boolean; targetGender: TargetGender }
) {
  const store = getStore();
  const existingMatch = store.activeMatches.get(peerId);
  let previousPartnerPeerId: string | undefined;

  if (existingMatch) {
    existingMatch.partnerSkippedBy = peerId;
    const isUserA = existingMatch.userA.peerId === peerId;
    previousPartnerPeerId = isUserA ? existingMatch.userB.peerId : existingMatch.userA.peerId;
    store.activeMatches.delete(peerId);
  }

  // Immediately re-enter queue to find next person
  return await joinOrFindMatch({
    peerId,
    displayName: userInfo.displayName,
    gender: userInfo.gender,
    isPremium: userInfo.isPremium,
    targetGender: userInfo.targetGender,
    previousPeerId: previousPartnerPeerId,
  });
}

export function leaveQueueOrMatch(peerId: string): void {
  const store = getStore();
  store.waitingQueue.delete(peerId);
  const match = store.activeMatches.get(peerId);
  if (match) {
    match.partnerSkippedBy = peerId;
    store.activeMatches.delete(peerId);
  }
}
