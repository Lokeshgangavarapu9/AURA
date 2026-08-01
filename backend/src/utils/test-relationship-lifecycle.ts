import { preferenceTracker } from '../relationship/profile/preference.tracker.js';
import { levelCalculator } from '../relationship/lifecycle/level.calculator.js';
import { eventTracker } from '../relationship/lifecycle/event.tracker.js';
import { milestoneTracker } from '../relationship/lifecycle/milestone.tracker.js';
import { historyTracker } from '../relationship/lifecycle/history.tracker.js';
import { UserCommunicationProfileModel } from '../relationship/profile/profile.model.js';
import { MilestoneRecord, RelationshipEvent } from '../relationship/types/index.js';

function testRelationshipLifecycleSuite() {
  console.log('🧪 Testing Relationship & Personalization Engine — Step 3 Lifecycle Suite...');

  // 1. PreferenceTracker Gradual Learning Test
  console.log('\n--- Test 1: PreferenceTracker Gradual Learning ---');
  let profile = UserCommunicationProfileModel.createDefault();

  profile = preferenceTracker.updateProfile(profile, 'hey bro wtf lol wanna chill', 1);
  console.log('Turn 1 Profile Formality:', profile.preferredFormality);
  if (profile.preferredFormality !== 'balanced') {
    throw new Error('Test 1 Failed: Preference changed drastically on single message turn 1!');
  }

  profile = preferenceTracker.updateProfile(profile, 'hey bro cool lol wanna hang out', 3);
  console.log('Turn 3 Profile Formality:', profile.preferredFormality);
  if (profile.preferredFormality !== 'casual') {
    throw new Error('Test 1 Failed: Preference failed to learn casual style over 3 turns!');
  }

  // 2. LevelCalculator Deterministic Transitions Test
  console.log('\n--- Test 2: LevelCalculator Deterministic Transitions ---');
  const levelStranger = levelCalculator.calculateLevel(10, 15, 2, 0);
  const levelAcquaintance = levelCalculator.calculateLevel(25, 30, 6, 0);
  const levelCompanion = levelCalculator.calculateLevel(50, 50, 25, 0);
  const levelFriend = levelCalculator.calculateLevel(70, 70, 55, 1);
  const levelConfidant = levelCalculator.calculateLevel(90, 90, 105, 3);

  console.log(`Stranger: ${levelStranger} | Acquaintance: ${levelAcquaintance} | Companion: ${levelCompanion} | Friend: ${levelFriend} | Confidant: ${levelConfidant}`);

  if (
    levelStranger !== 'stranger' ||
    levelAcquaintance !== 'acquaintance' ||
    levelCompanion !== 'companion' ||
    levelFriend !== 'close_friend' ||
    levelConfidant !== 'confidant'
  ) {
    throw new Error('Test 2 Failed: LevelCalculator deterministic transition mismatch!');
  }

  // 3. EventTracker Append-Only & Event Detection Test
  console.log('\n--- Test 3: EventTracker Append-Only & Detection ---');
  const initialEvents: RelationshipEvent[] = [];
  const turn1Events = eventTracker.evaluateEvents(initialEvents, 'My goal is to learn quantum computing and I am worried about math', 't-1');
  console.log('Turn 1 Events Count:', turn1Events.length, 'Types:', turn1Events.map((e) => e.type));

  if (turn1Events.length !== 2) {
    throw new Error('Test 3 Failed: Expected goal_shared and vulnerability events!');
  }

  const turn2Events = eventTracker.evaluateEvents(turn1Events, 'Thank you so much for helping me', 't-2');
  console.log('Turn 2 Events Total Count:', turn2Events.length);

  if (turn2Events.length !== 3 || turn2Events[0].id !== turn1Events[0].id) {
    throw new Error('Test 3 Failed: EventTracker is not strictly append-only!');
  }

  // 4. MilestoneTracker Unique ID & Duplicate Prevention Test
  console.log('\n--- Test 4: MilestoneTracker Duplicate Prevention ---');
  let milestones: MilestoneRecord[] = [];

  milestones = milestoneTracker.evaluateMilestones(milestones, 10, 1, []);
  console.log('Turn 1 Milestones Count:', milestones.length, 'ID:', milestones[0].id);

  // Evaluate same state again
  const duplicateCheck = milestoneTracker.evaluateMilestones(milestones, 10, 1, []);
  console.log('Duplicate Check Count:', duplicateCheck.length);

  if (duplicateCheck.length !== milestones.length) {
    throw new Error('Test 4 Failed: MilestoneTracker created duplicate milestone!');
  }

  // 5. HistoryTracker Meaningful Transition Filtering Test
  console.log('\n--- Test 5: HistoryTracker Transition Filtering ---');

  // Minor turn (No history created)
  const historyNoChange = historyTracker.evaluateHistory([], 't-1', 'stranger', 'stranger', 0.2, 0.1, 0.5);
  console.log('Minor Turn History Count:', historyNoChange.length);
  if (historyNoChange.length !== 0) {
    throw new Error('Test 5 Failed: Unnecessary history entry created for minor turn!');
  }

  // Meaningful level change turn
  const historyLevelChange = historyTracker.evaluateHistory([], 't-2', 'stranger', 'acquaintance', 5.5, 2.0, 12.0);
  console.log('Level Change History Count:', historyLevelChange.length, 'Reason:', historyLevelChange[0].reason);

  if (historyLevelChange.length !== 1 || historyLevelChange[0].newLevel !== 'acquaintance') {
    throw new Error('Test 5 Failed: History entry missing for level promotion!');
  }

  console.log('\n🎉 Phase 4.2 Step 3 Lifecycle Suite Passed Successfully!');
}

testRelationshipLifecycleSuite();
