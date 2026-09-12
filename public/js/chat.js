// Pastoral Care & Counseling Live Chat Simulation
document.addEventListener('DOMContentLoaded', () => {
  const chatBubble = document.getElementById('chat-bubble-btn');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close-btn');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  if (!chatBubble || !chatPanel) return;

  function toggleChat() {
    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) {
      if (chatInput) chatInput.focus();
    }
  }

  chatBubble.addEventListener('click', toggleChat);
  if (chatClose) chatClose.addEventListener('click', toggleChat);

  function appendMessage(text, sender = 'agent') {
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender === 'agent' ? 'chat-msg-agent' : 'chat-msg-user'}`;
    msg.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Empathetic counseling rule-based engine
  function getPastoralResponse(userInput) {
    const input = userInput.toLowerCase();

    if (input.includes('anxiety') || input.includes('panic') || input.includes('afraid') || input.includes('fear')) {
      return "I hear the heaviness in your words. Please know that God doesn't shame you for feeling anxious. Philippians 4:6-7 says God wants to exchange your dread for a peace that surpasses understanding. Would you like to say a simple prayer with me right now?";
    }
    if (input.includes('save') || input.includes('accept jesus') || input.includes('born again') || input.includes('salvation') || input.includes('sinner')) {
      return "What a precious and sacred question! Accepting Jesus is as simple as admitting we need Him, believing He died and rose for us, and inviting Him into our lives. You can visit our Decision page (/decision.html) to read the prayer of salvation step by step. Would you like to pray it today?";
    }
    if (input.includes('grief') || input.includes('lost someone') || input.includes('death') || input.includes('sad')) {
      return "I am so deeply sorry for the pain you are carrying. The Bible tells us that 'The Lord is near to the brokenhearted' (Psalm 34:18). Jesus Himself wept when His friend died. God is right there with you in this sorrow; you are not alone.";
    }
    if (input.includes('pray for me') || input.includes('prayer') || input.includes('help me')) {
      return "It would be an honor to pray for you. 'Lord Jesus, I lift this precious person to You right now. You know their heart, their silent tears, and their unspoken burdens. Wrap them in Your peace and let them know how fiercely they are loved. Amen.' You can also submit this to our community prayer wall!";
    }
    if (input.includes('doubt') || input.includes('bible') || input.includes('is god real') || input.includes('why')) {
      return "Honest questions are welcomed by God. Even John the Baptist asked if Jesus was truly the Messiah when he was in prison. Our Gospel section (/gospel.html) explores historical evidence, why suffering exists, and common doubts. What is the biggest question on your heart today?";
    }
    if (input.includes('church') || input.includes('find a church') || input.includes('fellowship')) {
      return "Connecting with a warm, Gospel-centered spiritual family is essential. Look for a church where the Bible is taught with grace and love. We also offer guidance on our New Believers page (/new-believers.html). Where are you located?";
    }

    return "Thank you for sharing that with me. God knows everything you are going through, and He cares for you deeply. Is there something specific on your heart you would like us to pray for together?";
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendMessage(text, 'user');
      chatInput.value = '';

      // Typing indicator delay
      setTimeout(() => {
        const reply = getPastoralResponse(text);
        appendMessage(reply, 'agent');
      }, 700);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
