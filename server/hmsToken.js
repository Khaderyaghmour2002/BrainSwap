import { FirebaseAuth } from '../server/firebaseConfig';

const FUNCTION_BASE =
  'https://us-central1-brainswap-bd812.cloudfunctions.net/api';

export const getHmsAuthToken = async ({ roomId, role = 'host' }) => {
  const userId = FirebaseAuth.currentUser.uid;

  const res = await fetch(`${FUNCTION_BASE}/generate100msToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, roomId, role }),
  });

  const { token } = await res.json();
  if (!token) throw new Error('No token returned');
  return token;
};
