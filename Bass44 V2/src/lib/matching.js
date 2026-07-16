const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };


import { getAdminEmail } from './profileHelpers';

export const MATCH_ADMIN_EMAIL = 'ghotokbari@gmail.com';

// Build a readable biodata string from a profile record (all registration fields)
function formatBiodata(p) {
  if (!p) return 'N/A';
  return `
  Name (English): ${p.name_english || '—'}
  Name (Bangla): ${p.name_bangla || '—'}
  Age: ${p.age || '—'}
  Gender: ${p.gender || '—'}
  Religion: ${p.religion || '—'}
  Marital Status: ${p.marital_status || '—'}
  Occupation: ${p.occupation || '—'}
  Height: ${p.height || '—'}
  Blood Group: ${p.blood_group || '—'}
  Division: ${p.division || '—'}
  District: ${p.district || '—'}
  Full Address: ${p.full_address || '—'}
  Mobile: ${p.mobile || '—'}
  Email: ${p.email || '—'}
  Bio: ${p.bio || '—'}
  Membership: ${p.membership || '—'}
  `;
}

// Core: create Match record + email ghotokbari@gmail.com + in-app notifications for both
export async function createMatch(profileA, profileB) {
  const nameA = profileA.name_english || profileA.name_bangla || 'Member A';
  const nameB = profileB.name_english || profileB.name_bangla || 'Member B';
  const adminEmail = getAdminEmail() || MATCH_ADMIN_EMAIL;

  // Create Match record (check both directions to avoid duplicates)
  const m1 = await db.entities.Match.filter({ profile_a_id: profileA.id, profile_b_id: profileB.id });
  const m2 = await db.entities.Match.filter({ profile_a_id: profileB.id, profile_b_id: profileA.id });
  if (m1.length === 0 && m2.length === 0) {
    await db.entities.Match.create({
      profile_a_id: profileA.id,
      profile_b_id: profileB.id,
      profile_a_name: nameA,
      profile_b_name: nameB,
      notified: true,
    });
  }

  // Send email to ghotokbari@gmail.com with full biodata of both
  const subject = `Matching Successful — ${nameA} & ${nameB}`;
  const body = `MATCHING SUCCESS NOTIFICATION
${'='.repeat(50)}

A new match has been created on GhotokBari.com!

${nameA} ❤️ ${nameB}

--- BIODATA OF ${nameA} ---${formatBiodata(profileA)}

--- BIODATA OF ${nameB} ---${formatBiodata(profileB)}

Match Date: ${new Date().toLocaleString()}

— GhotokBari Admin System`;
  await db.integrations.Core.SendEmail({ to: adminEmail, subject, body });

  // In-app notifications for both users
  await db.entities.Notification.create({
    user_profile_id: profileA.id,
    type: 'match',
    message_bn: `🎉 অভিনন্দন! ${nameB} এর সাথে ম্যাচ সফল হয়েছে!`,
    message_en: `🎉 Congratulations! Match successful with ${nameB}!`,
    related_profile_id: profileB.id,
    read: false,
  });
  await db.entities.Notification.create({
    user_profile_id: profileB.id,
    type: 'match',
    message_bn: `🎉 অভিনন্দন! ${nameA} এর সাথে ম্যাচ সফল হয়েছে!`,
    message_en: `🎉 Congratulations! Match successful with ${nameA}!`,
    related_profile_id: profileA.id,
    read: false,
  });
}

// Accept a like (from Dashboard) → create match
export async function acceptLikeAndMatch(like, fromProfile, toProfile) {
  await db.entities.Like.update(like.id, { status: 'accepted' });
  await createMatch(fromProfile, toProfile);
}

// Check for mutual like (called from ProfileDetail when a user likes someone)
// fromProfile = the user who just liked, toProfile = the user they liked
// Returns true if a match was created (toProfile had already liked fromProfile)
export async function checkAndCreateMatch(fromProfile, toProfile) {
  // Check if toProfile already liked fromProfile (reverse like, still pending)
  const reverseLikes = await db.entities.Like.filter({
    from_profile_id: toProfile.id,
    to_profile_id: fromProfile.id,
    status: 'pending',
  });
  if (reverseLikes.length === 0) return false;

  // Mutual like! Mark reverse like as accepted
  await db.entities.Like.update(reverseLikes[0].id, { status: 'accepted' });

  // Also mark the forward like (just created) as accepted
  const forwardLikes = await db.entities.Like.filter({
    from_profile_id: fromProfile.id,
    to_profile_id: toProfile.id,
  });
  if (forwardLikes.length > 0) {
    await db.entities.Like.update(forwardLikes[0].id, { status: 'accepted' });
  }

  // Create the match + email + notifications
  await createMatch(fromProfile, toProfile);
  return true;
}

// Reject a like → update status → notify sender
export async function rejectLike(like, fromProfile, toProfile) {
  await db.entities.Like.update(like.id, { status: 'rejected' });
  if (fromProfile) {
    await db.entities.Notification.create({
      user_profile_id: fromProfile.id,
      type: 'rejection',
      message_bn: `${toProfile?.name_bangla || toProfile?.name_english || 'একজন মেম্বার'} আপনার রিকোয়েস্ট রিজেক্ট করেছেন।`,
      message_en: `${toProfile?.name_english || 'A member'} rejected your request.`,
      related_profile_id: toProfile?.id,
      read: false,
    });
  }
}