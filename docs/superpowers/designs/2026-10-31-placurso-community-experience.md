# Placurso — Community Experience & Functional Access Design

**Date:** 2026-10-31  
**Scope:** public experience, member access, challenge navigation, game panels, community/referral flow, biblical learning, and preservation of existing engines.

## 1. Objective

Turn the current collection of working challenge engines into one coherent product experience without discarding the existing Phase 1–3A/3B/3C/3D functionality.

The visitor should experience Placurso as a place to relax, play, learn, train, discover abilities, and return. Commercial offers remain part of the product, but user-facing communication emphasizes benefits, relevance, learning, discovery, and belonging to a community.

## 2. Functional journey

```text
PUBLIC HOME
  -> Centro de Desafios (horizontal)
  -> 1 challenge available to try
  -> Psychotechnical challenge (exactly 7 questions)
  -> Result / invitation to continue
  -> Invite 5 people
  -> Registration / inscription
  -> Área de Aluno
  -> Centro de Desafios at top
  -> Choose dedicated experience
  -> Game-specific panel
  -> Result
  -> ANNAN interpretation
  -> Evolution / next experience / relevant learning
```

The public home does **not** expose the student's evolution dashboard. It may invite the visitor to “Acompanhar a sua evolução”, but evolution becomes visible inside the registered student area.

## 3. Public experience

Primary elements:
- Centro de Desafios as a horizontal, touch-friendly discovery row.
- One clear invitation to try an experience.
- Psychotechnical entry challenge with exactly 7 questions and compact presentation.
- Biblical experiences are visible as a genuine learning/entertainment category, not as a commercial pitch.
- Footer contains access to Área de Aluno and Infoprodutos/produtos.
- Bybit link remains available where appropriate for the crypto-learning journey.

Avoid user-facing implementation language such as phase numbers, engines, XP internals, conversion language, or technical architecture.

## 4. Student area

The Área de Aluno is a navigation hub, not a wall of playable games.

Top priority:
1. Centro de Desafios.
2. Continue / recommended challenge.
3. A Minha Evolução.
4. Aprender / relevant learning.
5. Community/invitation actions.

The student can enter each experience through its own dedicated panel.

## 5. Dedicated game panels

Every game family gets an adapted panel rather than sharing one generic execution surface.

Minimum structure:
- identity/title and short value proposition;
- rules/how to play;
- playable experience;
- result;
- ANNAN feedback;
- next challenge;
- relevant learning offer;
- optional community/invitation action.

The commercial layer is expressed as useful next steps, not hidden manipulation or alarming language.

## 6. Existing engines to preserve

Do not rewrite working game logic unnecessarily. Preserve and reuse:
- Phase 3A memory, reflex, financial decision, and mini-business experiences;
- Phase 3B progression/experience layer;
- Trade/crypto formation from basic to advanced;
- Phase 3C crypto missions and progression rules;
- Phase 3D ANNAN profile and recommendation logic;
- local persistence and existing progress events where they remain useful.

The new work is primarily an access/orchestration layer and presentation layer around these engines.

## 7. Biblical learning

Create a first-class “Bíblia / Conhecer Deus” experience family.

Its primary purpose is teaching through interaction:
- Bible knowledge;
- stories and characters;
- verses and memory;
- values and principles;
- comprehension;
- application scenarios;
- progressive levels from basic knowledge to deeper understanding.

ANNAN may explain answers and suggest the next learning experience. Avoid treating this family as a generic commercial funnel.

## 8. Access and persistence

The functional target is a real distinction between public visitors and registered students. The access layer should be designed so that authentication/registration can be backed by the existing Supabase infrastructure without exposing privileged keys.

Referral/invitation progress should be represented as explicit state rather than a visual-only claim. The implementation must not falsely report five completed referrals when only five share clicks occurred.

Existing localStorage progress can remain as a compatibility layer during migration; authenticated student state should become the durable source of truth when backend access is available.

## 9. Technical architecture

```text
PLACURSO
├── Public Experience
│   ├── Challenge Discovery
│   ├── 7-question Psychotechnical
│   ├── Biblical Discovery
│   └── Footer access
├── Access Layer
│   ├── Invitation/referral state
│   ├── Registration/authentication
│   └── Member session
├── Student Shell
│   ├── Challenge Center
│   ├── Evolution
│   ├── Learning
│   └── Community
├── Experience Router
│   ├── Memory
│   ├── Focus/Reflex
│   ├── Decision/Finance
│   ├── Business
│   ├── Crypto/Trade formation
│   └── Bible
├── Existing Engines
│   ├── Phase 3A
│   ├── Phase 3B
│   ├── Phase 3C
│   └── Phase 3D / ANNAN
└── Data
    ├── existing local progress compatibility
    └── authenticated durable state
```

## 10. Functional priorities

Priority order:
1. Access and navigation must work.
2. Visitor must understand what to do within seconds.
3. Every challenge must launch reliably.
4. Results must return reliably.
5. Student state must persist correctly.
6. ANNAN recommendations must use real experience data.
7. Biblical learning must work independently.
8. Offers and invitations must appear only where contextually useful.
9. Visual polish comes after functional correctness.

## 11. Non-goals for this iteration

- Rebuilding existing game engines from scratch.
- Replacing ANNAN's current profile logic unnecessarily.
- Introducing a large framework migration.
- Exposing internal phase/implementation terminology to users.
- Making the public home a full student dashboard.
- Claiming medical treatment for anxiety or depression.

## 12. Acceptance criteria

A build is functionally acceptable when:
- a new visitor can reach and complete the 7-question challenge;
- the public page does not expose student evolution data;
- the visitor can enter the invitation/registration path;
- a registered student reaches a distinct Área de Aluno;
- Centro de Desafios is present at the top of the student area;
- each selected game opens its own experience panel;
- existing Phase 3A/3C game logic still runs;
- Trade remains educational/simulation-based;
- biblical challenges can be discovered and completed;
- result -> ANNAN -> next action works;
- progress is not falsely represented;
- mobile interaction is usable;
- no DIONUEL/Kunica project or deployment is touched.

## 13. Deployment constraint

Do not deploy intermediate fragments. Batch the functional changes, run the full verification suite, verify the generated Netlify package and production target, then use one production deployment for this iteration whenever possible.
