import { useState } from 'react';
import { Box, Fab, Paper, Typography, TextField, IconButton, Fade, Divider } from '@mui/material';
import { Chat, Close, Send, SmartToy } from '@mui/icons-material';

const FAQ = [
  { q: 'What is GigShield?', a: 'GigShield is an AI-powered parametric insurance platform that protects gig workers from income loss due to weather disruptions, pollution, and curfews.' },
  { q: 'How does auto-claim work?', a: 'When a disruption (like heavy rain or extreme pollution) is detected in your area, a claim is automatically triggered and processed. No paperwork needed!' },
  { q: 'What does the premium cover?', a: 'Your weekly premium covers income loss protection. When disruptions prevent you from working, you receive an instant payout based on your coverage amount.' },
  { q: 'How is my premium calculated?', a: 'Our AI engine analyzes weather patterns, pollution levels, and historical data for your location to calculate a personalized weekly premium.' },
  { q: 'When do I get paid?', a: 'Payouts are processed instantly via UPI or bank transfer once a valid claim is approved by our automated system.' },
  { q: 'What is fraud detection?', a: 'Our system checks for duplicate claims, location mismatches, and unusual claim patterns to ensure fair use for all gig workers.' },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! 👋 I\'m GigShield Assistant. How can I help you today? Try asking about policies, claims, or premiums.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { from: 'user', text: userMsg }]);
    setInput('');

    // Simple keyword matching
    const lower = userMsg.toLowerCase();
    let reply = "I'm not sure about that. You can ask me about policies, claims, premiums, fraud detection, or how GigShield works!";

    for (const faq of FAQ) {
      const keywords = faq.q.toLowerCase().split(' ').filter(w => w.length > 3);
      if (keywords.some(kw => lower.includes(kw))) {
        reply = faq.a;
        break;
      }
    }

    if (lower.includes('hello') || lower.includes('hi')) reply = 'Hello! 👋 How can I help you with GigShield today?';
    if (lower.includes('thank')) reply = 'You\'re welcome! Stay safe on the roads! 🛡️';
    if (lower.includes('premium') || lower.includes('price') || lower.includes('cost')) reply = FAQ[3].a;
    if (lower.includes('claim') || lower.includes('payout')) reply = FAQ[1].a;
    if (lower.includes('fraud')) reply = FAQ[5].a;

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
    }, 500);
  };

  return (
    <>
      <Fade in={open}>
        <Paper elevation={8} sx={{
          position: 'fixed', bottom: 90, right: 24, width: 360, maxHeight: 480,
          borderRadius: 3, overflow: 'hidden', zIndex: 1300, display: open ? 'flex' : 'none',
          flexDirection: 'column'
        }}>
          <Box sx={{ bgcolor: '#D32F2F', color: '#fff', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy />
              <Typography fontWeight={600}>GigShield Assistant</Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2, maxHeight: 320, bgcolor: '#fafafa' }}>
            {messages.map((msg, i) => (
              <Box key={i} sx={{
                display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', mb: 1.5
              }}>
                <Box sx={{
                  maxWidth: '80%', p: 1.5, borderRadius: 2,
                  bgcolor: msg.from === 'user' ? '#D32F2F' : '#fff',
                  color: msg.from === 'user' ? '#fff' : '#333',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontSize: '0.875rem', lineHeight: 1.5
                }}>
                  {msg.text}
                </Box>
              </Box>
            ))}
          </Box>

          <Divider />
          <Box sx={{ p: 1.5, display: 'flex', gap: 1, bgcolor: '#fff' }}>
            <TextField size="small" fullWidth placeholder="Type a message..." variant="outlined"
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }} />
            <IconButton color="primary" onClick={handleSend}><Send /></IconButton>
          </Box>
        </Paper>
      </Fade>

      <Fab color="primary" onClick={() => setOpen(!open)}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300, boxShadow: '0 4px 20px rgba(211,47,47,0.4)' }}>
        {open ? <Close /> : <Chat />}
      </Fab>
    </>
  );
}
