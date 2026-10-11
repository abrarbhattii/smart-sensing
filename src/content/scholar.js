const PROFILE_ID = 'sawaid_abbas';

/** Team member and bio rows for the Dr. Sawaid Abbas profile pages. */
export function useScholar(team) {
    const member = team.members.find((m) => m.id === PROFILE_ID) || null;
    const bio = team.bios[PROFILE_ID] || {};
    return { member, bio };
}
