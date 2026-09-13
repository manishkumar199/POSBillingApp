/**
 * Audio feedback and UPI utilities for Chai stall counter operations
 */

export function playSoundboxChime(amount?: number, lang: 'hi' | 'en' = 'hi') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // Pleasant two-tone chime (high ding-dong like modern soundbox)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15); // E6
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second bell tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1760, now + 0.15); // A6
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);

    // If SpeechSynthesis is available, announce amount in friendly spoken voice
    if ('speechSynthesis' in window && amount && amount > 0) {
      setTimeout(() => {
        try {
          const isHindi = lang === 'hi';
          const spokenText = isHindi ? `${amount} रुपये प्राप्त हुए` : `Received rupees ${amount}`;
          const utterance = new SpeechSynthesisUtterance(spokenText);
          if (isHindi) {
            utterance.lang = 'hi-IN';
          }
          utterance.rate = 1.05;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        } catch {
          // Ignore speech errors
        }
      }, 400);
    }
  } catch (err) {
    console.warn('Audio playback not permitted or not supported', err);
  }
}

export function playTapSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore audio error
  }
}

export function buildUpiPayUrl(params: {
  upiId: string;
  merchantName: string;
  amount?: number;
  note?: string;
}): string {
  const { upiId, merchantName, amount, note } = params;
  let url = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&cu=INR`;
  if (amount !== undefined && amount > 0) {
    url += `&am=${amount.toFixed(2)}`;
  }
  if (note) {
    url += `&tn=${encodeURIComponent(note)}`;
  }
  return url;
}

export function createWhatsAppReminderUrl(params: {
  customerName: string;
  phone: string;
  balance: number;
  stallName: string;
  upiId: string;
  lang?: 'hi' | 'en';
}): string {
  const { customerName, phone, balance, stallName, upiId, lang = 'hi' } = params;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const upiLink = buildUpiPayUrl({
    upiId,
    merchantName: stallName,
    amount: balance,
    note: `Khata payment - ${customerName}`,
  });

  const message = lang === 'hi'
    ? `नमस्ते ${customerName} जी 🙏,
*${stallName}* से आपके चाय-नाश्ते के उधार (खाता) का हिसाब:

कुल बाकी रकम: *₹${balance.toFixed(2)}*

आप सीधे फोनपे / गूगलपे / पेटीएम द्वारा इस यूपीआई आईडी पर भेज सकते हैं:
👉 *${upiId}*
सीधा भुगतान करने का लिंक: ${upiLink}

धन्यवाद! चाय की चुस्की के लिए हमेशा स्वागत है ☕✨`
    : `Namaste ${customerName} ji 🙏,
This is a gentle update from *${stallName}*.

Your current Udhar (Khata) balance is: *₹${balance.toFixed(2)}*.

You can pay via UPI directly using our ID:
👉 *${upiId}*
Or click to open payment: ${upiLink}

Thank you for your regular patronage! ☕✨`;

  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(val);
}
