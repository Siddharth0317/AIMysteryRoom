/**
 * AI Mystery Room — Detective Achievements & Badges (SPEC.md Section 17.7)
 * Stable identifiers, descriptions, and criteria evaluated strictly from server records.
 */

export const ACHIEVEMENTS = [
  {
    id: 'FIRST_SOLVE',
    title: 'First Breakthrough',
    description: 'Successfully solve your first cyber-crime investigation.',
    icon: 'award',
    tier: 'bronze',
  },
  {
    id: 'PERFECT_INVESTIGATION',
    title: 'Pure Deduction',
    description: 'Solve a case without requesting any tactical hints.',
    icon: 'zap',
    tier: 'gold',
  },
  {
    id: 'MASTER_SLEUTH',
    title: 'Apex Detective',
    description: 'Successfully solve a case on Hard difficulty tier.',
    icon: 'shield',
    tier: 'platinum',
  },
  {
    id: 'FORENSIC_SPECIALIST',
    title: 'Chain of Custody',
    description: 'Decrypt 100% of forensic clues in a single case.',
    icon: 'key',
    tier: 'silver',
  },
  {
    id: 'CROSS_EXAMINER',
    title: 'Interrogation Master',
    description: 'Interrogate suspects 3 or more times in a single case.',
    icon: 'message-square',
    tier: 'silver',
  },
  {
    id: 'THEORY_CRAFTER',
    title: 'Neural Architect',
    description: 'Map 3 or more hypothesis links on the Evidence Board.',
    icon: 'share-2',
    tier: 'bronze',
  },
  {
    id: 'VETERAN_INVESTIGATOR',
    title: 'Archive Keeper',
    description: 'Attempt 5 or more investigations in the terminal.',
    icon: 'terminal',
    tier: 'gold',
  },
];
