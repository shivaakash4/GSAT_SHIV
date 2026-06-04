export function notifyAdmin(userEmail: string) {
  const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
      to:         process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      subject:    'GSAT Login Alert',
      message:    `User logged in:\n\nEmail: ${userEmail}\nTime: ${timeStr} (IST)`,
    }),
  }).catch(() => {}); // silent fail — never block login
}
