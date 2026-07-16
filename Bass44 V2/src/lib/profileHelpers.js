const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Dummy profile photos by gender — used when a member doesn't upload a photo
export const MALE_DUMMY_PHOTO = 'https://media.db.com/images/public/6a3458ecaaa19f31142ab93b/d323d059a_generated_image.png';
export const FEMALE_DUMMY_PHOTO = 'https://media.db.com/images/public/6a3458ecaaa19f31142ab93b/df6cd9bd9_generated_image.png';

export function getProfilePhoto(profile) {
  if (profile?.photo_url) return profile.photo_url;
  if (profile?.gender === 'female') return FEMALE_DUMMY_PHOTO;
  return MALE_DUMMY_PHOTO;
}

// Admin email for match notifications — stored in localStorage, editable in Admin settings
export const DEFAULT_ADMIN_EMAIL = 'ghotokbari@gmail.com';

export function getAdminEmail() {
  return localStorage.getItem('admin_email') || DEFAULT_ADMIN_EMAIL;
}

export function setAdminEmail(email) {
  localStorage.setItem('admin_email', email);
}