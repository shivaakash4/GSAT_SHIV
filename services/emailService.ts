export function notifyAdmin(userEmail: string, action: 'login' | 'signup' = 'login') {
  const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const label   = action === 'signup' ? 'New Signup' : 'Login';

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: (process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '').trim(),
      subject:    `GSAT ${label} Alert`,
      message:    `GSAT ${label}:\n\nEmail: ${userEmail}\nTime:  ${timeStr} (IST)`,
    }),
  }).catch(() => {}); // silent fail — never block auth
}
