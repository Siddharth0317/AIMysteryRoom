/**
 * AI Mystery Room — Mock Data & Case Simulation Engine (Phase 1)
 * 
 * Provides structured mock cases strictly compliant with SPEC.md Section 4:
 * - Easy: 3 suspects, 5 clues, 2 hints, 100 base points
 * - Medium: 4 suspects, 7 clues, 3 hints, 150 base points
 * - Hard: 5 suspects, 9 clues, 3 hints, 200 base points
 */

export const MOCK_PRESETS = [
  {
    title: "The Silent Breach of Sector 7",
    difficulty: "medium",
    premise: "A high-security quantum research archive in Neo-Kyoto was breached at 02:40 AM. The primary neural ledger was purged, but physical and digital traces remain."
  },
  {
    title: "Ghost in the Orbital Spire",
    difficulty: "easy",
    premise: "During an atmospheric gala on the high-orbit Olympus Spire, the chief synth designer was locked out of her own neural chassis while guests watched."
  },
  {
    title: "Blackout at the Core Node",
    difficulty: "hard",
    premise: "A catastrophic blackout knocked out Sector 4's fusion grid. In the darkness, three corporate executives were intercepted and the master decryption cipher stolen."
  }
];

export const MOCK_CASES = {
  "case-easy-101": {
    id: "case-easy-101",
    title: "Ghost in the Orbital Spire",
    difficulty: "easy",
    premise: "During an atmospheric gala on the high-orbit Olympus Spire, the chief synth designer was locked out of her own neural chassis while guests watched.",
    story: "At 23:15 standard time during the Olympus High-Orbit Gala, Dr. Sela Ward suddenly collapsed onto the marble dais. Diagnostic scans revealed an emergency remote override command executed from a guest datapad within the ballroom. Three key guests with high-grade neural cyberdecks were in proximity.",
    suspects: [
      {
        id: "suspect_e1",
        name: "Lord Ronald Chen",
        role: "Corporate Executive",
        background: "Managing director of competing robotics conglomerate AetherCorp. Long-time rival of Dr. Ward.",
        motive: "AetherCorp's stock was set to plummet following Ward's upcoming patent demonstration.",
        alibi: "Claims he was on the observation promenade smoking synthetic cigars during the incident."
      },
      {
        id: "suspect_e2",
        name: "Kira 'Zero' Valen",
        role: "Celebrity Holo-Performer",
        background: "A renowned cyberpunk artist known for integrating illegal cyberdeck exploits into live performances.",
        motive: "Ward had recently terminated Valen's artistic neural license over safety violations.",
        alibi: "Claims she was backstage preparing her holographic encore performance."
      },
      {
        id: "suspect_e3",
        name: "Jax Miller",
        role: "Chief VIP Security Guard",
        background: "Former orbital marine in charge of VIP biometric sweeps and communications scrambling.",
        motive: "Bribed heavily by a shadowy broker to ensure an 'unexpected interruption' occurred.",
        alibi: "Claims he was stationed at the main ballroom checkpoint monitoring incoming guest telemetry."
      }
    ],
    clues: [
      {
        id: "clue_e1",
        title: "Encrypted Datapad Fragment",
        description: "A customized black onyx datapad recovered beneath the observation terrace chairs. It contains an active Bluetooth pairing to Ward's chassis.",
        discovered: true
      },
      {
        id: "clue_e2",
        title: "Synthetic Cigar Ash",
        description: "Rare imported menthol ash found on the observation deck, matching the luxury brand Ronald Chen smokes.",
        discovered: false
      },
      {
        id: "clue_e3",
        title: "Security Radio Log",
        description: "Audio logs reveal the ballroom jammer was deliberately switched off for 45 seconds at 23:14 by guard station 1.",
        discovered: false
      },
      {
        id: "clue_e4",
        title: "Holo-Projector Telemetry",
        description: "Projector logs show Valen's encore sequence was pre-programmed and running autonomously on an automated timer since 23:00.",
        discovered: false
      },
      {
        id: "clue_e5",
        title: "Wire Transfer Alert",
        description: "A flagged bank transmission of 80,000 Credits sent to Jax Miller's offshore account cleared precisely at 23:16.",
        discovered: false
      }
    ],
    hints: [
      {
        id: "hint_e1",
        text: "The override signal required the ballroom security jammer to be deactivated first. Review who controls that switch."
      },
      {
        id: "hint_e2",
        text: "Financial records reveal an immediate payout upon successful execution of the lockout."
      }
    ]
  },

  "case-med-409": {
    id: "case-med-409",
    title: "The Silent Breach of Sector 7",
    difficulty: "medium",
    premise: "A high-security quantum research archive in Neo-Kyoto was breached at 02:40 AM. The primary neural ledger was purged, but physical and digital traces remain.",
    story: "At 02:40 hours, security subroutines in Vault 7-Alpha detected an abrupt power surge followed by an irreversible neural ledger purge. Only four senior personnel held biometric and cryptographic clearance during the security blackout window. As the lead cyber-investigator, you must sift through physical residue, encrypted terminal logs, and surveillance anomalies to isolate the true culprit.",
    suspects: [
      {
        id: "suspect_m1",
        name: "Dr. Hideo Vance",
        role: "Lead Quantum Cryptographer",
        background: "Architect of Vault 7's biometric hashing algorithms. Facing financial ruin from black-market neural debts.",
        motive: "Severe gambling debts to the Neon Syndicate; rumors of an off-grid buyer offering millions for raw algorithms.",
        alibi: "Claims he was in the cryogenic cooling chamber calibrating sub-zero coolant rods during the blackout."
      },
      {
        id: "suspect_m2",
        name: "Evelyn 'Vex' Cross",
        role: "Senior Systems Architect",
        background: "Former syndicate intrusion tester hired under corporate amnesty to harden the perimeter defenses.",
        motive: "Bitter over corporate intellectual property theft regarding her proprietary neural interface framework.",
        alibi: "Claims she was inside her terminal pod running stress simulations on the perimeter firewall."
      },
      {
        id: "suspect_m3",
        name: "Officer Marcus Kane",
        role: "Chief of Physical & Cyber Security",
        background: "Ex-enforcer with access to all override codes, surveillance loops, and security patrol sweeps.",
        motive: "Due for mandatory retirement and severance downgrade; recently attempted to download employee dossiers.",
        alibi: "Claims he was conducting a physical inspection on the lower sublevels when alarms triggered."
      },
      {
        id: "suspect_m4",
        name: "Dr. Lyra Thorne",
        role: "Director of AI Synthesis",
        background: "Obsessed with synthetic consciousness transfer; openly opposed corporate plans to weaponize the ledger.",
        motive: "Ideological sabotage to prevent military weaponization of Vault 7's core algorithms.",
        alibi: "Claims she was logged into the archive synthesis lab reviewing telemetry feeds until the system rebooted."
      }
    ],
    clues: [
      {
        id: "clue_m1",
        title: "Corrupted Security Terminal Log",
        description: "Audit logs reveal an authorized biometric handprint scan at 02:37 AM from Terminal C-4. Cryptographic origin traced to Cryptography Station Alpha.",
        discovered: true
      },
      {
        id: "clue_m2",
        title: "Sub-Zero Coolant Pressure Drop",
        description: "Environmental telemetry records a sudden 14% drop in coolant pressure at 02:35 AM, accompanied by an override command logged with Dr. Vance's keycard.",
        discovered: false
      },
      {
        id: "clue_m3",
        title: "Syntricate Burn Residue",
        description: "A scorched fragment of military-grade EMP insulation discovered wedged beneath the primary vault relay.",
        discovered: false
      },
      {
        id: "clue_m4",
        title: "Off-Grid Packet Broadcast",
        description: "A burst transmission sent via unauthorized low-frequency packet radio toward the Neo-Kyoto Industrial Free-Zone at 02:41 AM.",
        discovered: false
      },
      {
        id: "clue_m5",
        title: "Spliced CCTV Telemetry",
        description: "Sublevel camera 4 shows an 8-minute repeating video loop beginning at 02:32 AM. The loop was injected locally from an internal maintenance port.",
        discovered: false
      },
      {
        id: "clue_m6",
        title: "Encrypted Offshore Ledger Deposit",
        description: "A shadow transaction of 250,000 CyberCredits routed through an untraceable Cayman mesh wallet with an activation condition tied to the ledger purge.",
        discovered: false
      },
      {
        id: "clue_m7",
        title: "Discarded Optical Fiber Scrubber",
        description: "A specialized hardware tool used exclusively by senior cryptographers found hidden in an air duct near the cooling conduits.",
        discovered: false
      }
    ],
    hints: [
      {
        id: "hint_m1",
        text: "The terminal log points to an override initiated from Cryptography Station Alpha. Check who possesses cryptographic authorization."
      },
      {
        id: "hint_m2",
        text: "The coolant pressure anomaly matches the exact window when the loop was injected, casting doubt on the cooling chamber alibi."
      },
      {
        id: "hint_m3",
        text: "The hardware fiber scrubber links the culprit directly to cryptographic hardware manipulation, eliminating non-cryptographic suspects."
      }
    ]
  },

  "case-hard-901": {
    id: "case-hard-901",
    title: "Blackout at the Core Node",
    difficulty: "hard",
    premise: "A catastrophic blackout knocked out Sector 4's fusion grid. In the darkness, three corporate executives were intercepted and the master decryption cipher stolen.",
    story: "At 03:00 hours, the primary magnetic confinement ring of Core Node 4 collapsed, blacking out the entire industrial grid. When emergency auxiliary generators kicked in 12 minutes later, the Master Decryption Cipher had been extracted from the central mainframe. Five key engineers and operatives were trapped inside the sealed blast doors.",
    suspects: [
      {
        id: "suspect_h1",
        name: "Director Kazuo Sato",
        role: "Grid Operations Director",
        background: "Oversees fusion distribution; secretly shorted energy futures prior to the collapse.",
        motive: "Massive market windfall if Core Node 4 failed to maintain uptime SLA contracts.",
        alibi: "Claims he was trapped in the high-voltage elevator between floors 14 and 15."
      },
      {
        id: "suspect_h2",
        name: "Engineer Maya Lin",
        role: "Plasma Confinement Specialist",
        background: "Brilliant physicist whose security clearances were suspended following unauthorized data exfiltration.",
        motive: "Revenge against corporate management for suppressing her clean energy reactor designs.",
        alibi: "Claims she was manually venting helium exhaust valves in the outer maintenance ring."
      },
      {
        id: "suspect_h3",
        name: "Dax Corvo",
        role: "Undercover Syndicate Operative",
        background: "Posing as a sub-contractor technician; known operative for the Zero-Day collective.",
        motive: "Syndicate contract to seize the Master Cipher and auction it to the highest bidder.",
        alibi: "Claims he was locked in the auxiliary supply room waiting out the blackout."
      },
      {
        id: "suspect_h4",
        name: "Dr. Aris Thorne",
        role: "Chief Mainframe Architect",
        background: "Architect of the cipher vault; suffering from degenerative cyberware degradation.",
        motive: "Needed funds to purchase an experimental quantum neural stabilizer on the black market.",
        alibi: "Claims he was unconscious in his office after inhaling ozone fumes from the initial surge."
      },
      {
        id: "suspect_h5",
        name: "Commander Vane",
        role: "Head of Facility Security",
        background: "Authoritarian security chief with top-level override access to all blast doors and biometric bypasses.",
        motive: "Disgruntled by imminent replacement by an autonomous AI security matrix.",
        alibi: "Claims he was coordinating manual door releases from the Central Security Bunker."
      }
    ],
    clues: [
      {
        id: "clue_h1",
        title: "Elevator Emergency Brake Log",
        description: "Telemetry from elevator 3 confirms the car was stopped, but the emergency roof hatch was opened at 03:02 AM.",
        discovered: true
      },
      {
        id: "clue_h2",
        title: "Plasma Bleed Valve Timestamp",
        description: "Valves show automatic venting triggered by system script, not manual valve operation.",
        discovered: false
      },
      {
        id: "clue_h3",
        title: "Syndicate Decryption Rig",
        description: "A compact quantum brute-forcing deck discovered in the ventilation shaft connecting elevator 3 to the Mainframe vault.",
        discovered: false
      },
      {
        id: "clue_h4",
        title: "Biometric Bypass Keycard",
        description: "A cloned security badge registered with Director Sato's encryption signature found near the vault entrance.",
        discovered: false
      },
      {
        id: "clue_h5",
        title: "Ozone Inhalation Toxin Report",
        description: "Medical air sensors confirm ozone levels in Dr. Thorne's office were below hazardous incapacitation thresholds.",
        discovered: false
      },
      {
        id: "clue_h6",
        title: "Short Position Financial Contract",
        description: "A digital futures contract executed at 02:58 AM—just two minutes before the grid collapse—betting against the reactor's stability.",
        discovered: false
      },
      {
        id: "clue_h7",
        title: "Blast Door Manual Override Log",
        description: "Central security logs reveal no manual door releases were triggered from the security bunker during the 12-minute window.",
        discovered: false
      },
      {
        id: "clue_h8",
        title: "Magnetic Confinement Detonation Code",
        description: "The core destabilization command was initiated via a wireless datalink matching Sato's personal comms frequency.",
        discovered: false
      },
      {
        id: "clue_h9",
        title: "Hidden Thermal Footprints",
        description: "Infrared thermal imaging shows a single figure climbing from the elevator shaft into the vault and back at 03:07 AM.",
        discovered: false
      }
    ],
    hints: [
      {
        id: "hint_h1",
        text: "The financial contract timing proves premeditation. Look for who stood to profit from the grid failure."
      },
      {
        id: "hint_h2",
        text: "Elevator 3's roof hatch was breached, connecting the occupant directly to the overhead vault duct."
      },
      {
        id: "hint_h3",
        text: "The detonation code and cloned card both tie back to executive-level access, eliminating lower-tier personnel."
      }
    ]
  }
};

/**
 * Module-private secret storage for simulated local cases.
 * Strictly adheres to SPEC.md Zero-Leakage Policy:
 * Secrets are NEVER stored in localStorage or exposed on the active case object.
 */
const MOCK_CASE_SECRETS = {
  "case-easy-101": {
    culpritId: "suspect_e3",
    culpritName: "Jax Miller",
    solution: "Officer Jax Miller accepted an 80,000 Credit bribe from AetherCorp. He temporarily disabled the VIP ballroom frequency jammer at 23:14, allowing the pre-loaded override signal to shut down Dr. Ward's chassis."
  },
  "case-med-409": {
    culpritId: "suspect_m1",
    culpritName: "Dr. Hideo Vance",
    solution: "Dr. Hideo Vance used his cryptographic master clearance to inject an 8-minute loop into the CCTV feeds, sabotaged the cooling manifold to trigger an emergency evacuation protocol, and purged the neural ledger after beaming an encrypted copy to the Neon Syndicate to clear his black-market debt."
  },
  "case-hard-901": {
    culpritId: "suspect_h1",
    culpritName: "Director Kazuo Sato",
    solution: "Director Kazuo Sato shorted the grid's power SLA futures for a massive financial windfall. He deliberately triggered the confinement collapse from his personal comms, escaped the stalled elevator through the roof hatch into the mainframe duct, and extracted the cipher while blaming the incident on an external cyber-attack."
  }
};

/**
 * Storage key for persisting active mock session in localStorage during Phase 1
 */
const STORAGE_KEY = "AIMysteryRoom_Phase1_ActiveCase";

export function getActiveMockCase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read from localStorage", err);
  }
  return null;
}

/**
 * Clears active case from localStorage
 */
export function clearActiveMockCase() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear localStorage", err);
  }
}

const ARCHIVE_KEY = "AIMysteryRoom_CaseArchive";

/**
 * Retrieves the history of all cases saved in this terminal
 */
export function getCaseArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Could not read case archive", err);
    return [];
  }
}

/**
 * Saves a case to the permanent Case Archive list
 */
export function saveToCaseArchive(caseData) {
  if (!caseData || !caseData.id) return;
  try {
    const safeData = { ...caseData };
    delete safeData._secret;
    if (safeData.status !== 'completed') {
      delete safeData.culpritId;
      delete safeData.solution;
    }
    const archive = getCaseArchive();
    const existingIndex = archive.findIndex((c) => c.id === safeData.id);
    if (existingIndex !== -1) {
      archive[existingIndex] = { ...safeData, updatedAt: new Date().toISOString() };
    } else {
      archive.unshift({ ...safeData, savedAt: new Date().toISOString() });
    }
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive.slice(0, 30)));
  } catch (err) {
    console.warn("Could not append to case archive", err);
  }
}

/**
 * Saves case to localStorage and syncs with archive with Zero-Leakage guarantee
 */
export function saveMockCase(caseData) {
  if (!caseData) return;
  try {
    const safeData = { ...caseData };
    delete safeData._secret;
    if (safeData.status !== 'completed') {
      delete safeData.culpritId;
      delete safeData.solution;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    saveToCaseArchive(safeData);
  } catch (err) {
    console.warn("Could not save to localStorage", err);
  }
}

/**
 * Generates a mock case from premise & difficulty
 */
export function createMockCase(premise, difficulty) {
  const baseKey = difficulty === "easy" 
    ? "case-easy-101" 
    : difficulty === "hard" 
      ? "case-hard-901" 
      : "case-med-409";
  
  const template = JSON.parse(JSON.stringify(MOCK_CASES[baseKey]));
  const newCaseId = `case-${Date.now().toString(36)}`;
  
  // Isolate secret in module scope memory so it is NEVER serialized to browser storage
  const baseSecret = MOCK_CASE_SECRETS[baseKey];
  if (baseSecret) {
    MOCK_CASE_SECRETS[newCaseId] = { ...baseSecret };
  }

  const newCase = {
    ...template,
    id: newCaseId,
    premise: premise.trim(),
    title: premise.length > 30 ? `${premise.slice(0, 30)}...` : template.title,
    difficulty: difficulty,
    status: "active",
    hintsUsed: 0,
    discoveredClueIds: [template.clues[0].id], // first clue starts discovered
    clues: template.clues.map((c, idx) => ({
      ...c,
      discovered: idx === 0
    }))
  };

  delete newCase._secret;
  delete newCase.culpritId;
  delete newCase.solution;

  saveMockCase(newCase);
  return newCase;
}

/**
 * Simulates discovering a clue
 */
export function discoverMockClue(caseId, clueId) {
  const currentCase = getActiveMockCase();
  if (currentCase.id !== caseId) return currentCase;

  const clueIndex = currentCase.clues.findIndex(c => c.id === clueId);
  if (clueIndex !== -1 && !currentCase.clues[clueIndex].discovered) {
    currentCase.clues[clueIndex].discovered = true;
    if (!currentCase.discoveredClueIds) currentCase.discoveredClueIds = [];
    if (!currentCase.discoveredClueIds.includes(clueId)) {
      currentCase.discoveredClueIds.push(clueId);
    }
    saveMockCase(currentCase);
  }
  return currentCase;
}

/**
 * Simulates requesting a hint
 */
export function useMockHint(caseId) {
  const currentCase = getActiveMockCase();
  if (currentCase.id !== caseId) return { error: "Case not found" };

  const maxHints = currentCase.difficulty === "easy" ? 2 : 3;
  const hintsUsed = currentCase.hintsUsed || 0;

  if (hintsUsed >= maxHints) {
    return { error: "HINT_LIMIT_REACHED", message: "Maximum hint allowance reached for this difficulty level." };
  }

  const nextHintIndex = hintsUsed;
  const nextHint = currentCase.hints[nextHintIndex];
  currentCase.hintsUsed = hintsUsed + 1;
  saveMockCase(currentCase);

  return {
    hint: nextHint,
    remainingHints: maxHints - currentCase.hintsUsed,
    updatedCase: currentCase
  };
}

/**
 * Simulates submitting an accusation and calculating authoritative backend score
 */
export function accuseMockSuspect(caseId, suspectId) {
  const currentCase = getActiveMockCase();
  if (currentCase.id !== caseId) return { error: "Case not found" };

  const fallbackKey = currentCase.difficulty === "easy" ? "case-easy-101" : currentCase.difficulty === "hard" ? "case-hard-901" : "case-med-409";
  const secret = MOCK_CASE_SECRETS[caseId] || MOCK_CASE_SECRETS[fallbackKey];
  const isCorrect = secret && secret.culpritId === suspectId;

  // Difficulty base points
  const basePointsMap = { easy: 100, medium: 150, hard: 200 };
  const basePoints = basePointsMap[currentCase.difficulty] || 100;

  // Scoring rule:
  // if correct: max(0, basePoints + (clues * 5) - (hints * 10))
  // if incorrect: 0
  const cluesDiscovered = (currentCase.discoveredClueIds || []).length;
  const hintsUsed = currentCase.hintsUsed || 0;

  let finalScore = 0;
  if (isCorrect) {
    finalScore = Math.max(0, basePoints + (cluesDiscovered * 5) - (hintsUsed * 10));
  }

  const scoreBreakdown = {
    difficulty: currentCase.difficulty,
    basePoints: isCorrect ? basePoints : 0,
    cluesBonus: isCorrect ? cluesDiscovered * 5 : 0,
    cluesCount: cluesDiscovered,
    hintsPenalty: isCorrect ? hintsUsed * 10 : 0,
    hintsCount: hintsUsed,
    finalScore: finalScore,
    isCorrect: isCorrect
  };

  const result = {
    verdict: isCorrect ? "correct" : "incorrect",
    culpritId: secret ? secret.culpritId : "unknown",
    culpritName: secret ? secret.culpritName : "Unknown Suspect",
    solution: secret ? secret.solution : "No solution records available.",
    accusedSuspectId: suspectId,
    score: finalScore,
    scoreBreakdown: scoreBreakdown,
    caseId: caseId,
    difficulty: currentCase.difficulty
  };

  currentCase.status = "completed";
  currentCase.result = result;
  saveMockCase(currentCase);

  return result;
}
