import React, { useState } from 'react';
import axios from 'axios';

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/chat', { message: input });
      const data = res.data;
      const botReply = { from: 'bot', text: data.reply, ...('package' in data ? { package: data.package } : {}) };
      setMessages(m => [...m, botReply]);
    } catch (err) {
      setMessages(m => [...m, { from: 'bot', text: 'Service error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{border:'1px solid #ddd', padding: 12, width: 360}}>
      <div style={{height: 300, overflowY: 'auto', marginBottom: 8}}>
        {messages.map((m, i) => (
          <div key={i} style={{textAlign: m.from === 'user' ? 'right' : 'left', margin: 6}}>
            <div style={{display:'inline-block', padding:8, borderRadius:8, background: m.from === 'user' ? '#e6f7ff' : '#f1f1f1'}}>
              {m.text}
              {m.package && <pre style={{whiteSpace:'pre-wrap', marginTop:6}}>{JSON.stringify(m.package, null, 2)}</pre>}
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'flex'}}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{flex:1}}/>
        <button onClick={send} disabled={loading} style={{marginLeft:8}}>{loading? '...' : 'Send'}</button>
      </div>
    </div>
  );
}
