document.addEventListener('DOMContentLoaded', function () {
  // Ambil semua elemen penting
  const audio = document.getElementById('audio');
  const chatContainer = document.getElementById('chat-container');
  const chatScrollContainer = document.getElementById('chat-scroll-container');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const restartBtn = document.getElementById('restartBtn');
  const progressBar = document.getElementById('progressBar');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationDisplay = document.getElementById('duration');
  const creditMessage = document.getElementById('credit-message');
  
  // Cek lagu lagi jalan apa nggak
  let isPlaying = false;

  // Lirik Fomo wkwkwk
  const lyrics = [
    { 
      time: 3.0, 
      text: "Sudah terbiasa terjadi tante...",
      charDelay: 0.1
    },
    { 
      time: 6.0, 
      text: "Teman datang ketika lagi butuh saja...",
      charDelay: 0.05
    },
    { 
      time: 10.0, 
      text: "Coba kalau lagi susaahhh...",
      charDelay: 0.08
    },
    { 
      time: 14.5, 
      text: "Mereka semua menghilaaaanggggg...",
      charDelay: 0.07
    },
    // Kredit
    { 
      time: 19.0, 
      isCredit: true,
    }
  ];

  // indikator lagi ngetik
  let typingIndicators = [];

  // Format waktu
  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Update progress bar
  function updateProgress() {
    const currentTime = audio.currentTime;
    const duration = audio.duration || 0;
    
    // Update posisi
    const percentage = (currentTime / duration) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Update angka waktu
    currentTimeDisplay.textContent = formatTime(currentTime);
    durationDisplay.textContent = formatTime(duration);
  }

  // Play atau pause lagu
  function togglePlayPause() {
    if (isPlaying) {
      audio.pause();
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    } else {
      audio.play();
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
    }
    isPlaying = !isPlaying;
  }

  // Ulang dari awal
  function restartAudio() {
    // Reset lagu
    audio.currentTime = 0;
    
    // Bersihin chat
    chatContainer.innerHTML = '';
    
    // Reset typing
    typingIndicators = [];
    
    // Ilangin kredit
    creditMessage.style.opacity = '0';
    
    // Jalanin lagunya
    if (!isPlaying) {
      togglePlayPause();
    } else {
      audio.play();
    }
  }

  // Munculin indikator lagi ngetik
  function showTypingIndicator(typingId, time) {
    // Cek udah ada belum
    if (typingIndicators.includes(typingId)) return;
    
    typingIndicators.push(typingId);
    
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('flex', 'justify-start', 'mb-4', 'message-appear');
    typingDiv.id = `typing-${typingId}`;
    
    const typingContent = `
      <div class="flex justify-center items-center space-x-3">
        <div class="relative">
          <img src="https://files.catbox.moe/1fcvkz.jpg" alt="Receiver Avatar" 
              class="w-12 h-12 rounded-full border-2 border-pink-500 shadow-md">
          <span class="absolute bottom-0 right-0 bg-green-500 rounded-full h-3 w-3 border-2 border-white"></span>
        </div>
        <div class="bg-gray-200 text-gray-900 p-3 rounded-r-lg rounded-bl-lg max-w-xs shadow-md">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
    
    typingDiv.innerHTML = typingContent;
    chatContainer.appendChild(typingDiv);
    
    // Auto scroll biar keliatan
    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
  }

  // Nambahin pesan dengan animasi per-huruf
  function addChatMessage(text, time, charDelay) {
    // Hapus indikator typing kalo ada
    const typingId = Math.floor(time);
    const typingIndicator = document.getElementById(`typing-${typingId}`);
    if (typingIndicator) {
      typingIndicator.remove();
      
      // Hapus dari daftar
      const index = typingIndicators.indexOf(typingId);
      if (index > -1) {
        typingIndicators.splice(index, 1);
      }
    }
    
    // Jangan tambahin lagi kalo udah ada
    if (document.querySelector(`[data-time='${time}']`)) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('flex', 'justify-start', 'mb-4', 'chat-bubble');
    messageDiv.setAttribute('data-time', time);
    
    // Bikin konten bubble chat
    // FIX: Memastikan spasi terender dengan benar 
    let processedText = '';
    for (let i = 0; i < text.length; i++) {
      // PERBAIKAN: Menggunakan non-breaking space untuk spasi
      if (text[i] === ' ') {
        processedText += `<span class="lyric-char" style="--char-index: ${i}">&nbsp;</span>`;
      } else {
        processedText += `<span class="lyric-char" style="--char-index: ${i}">${text[i]}</span>`;
      }
    }
    
    const messageContent = `
      <div class="flex justify-center items-center space-x-3">
        <div class="relative">
          <img src="https://files.catbox.moe/1fcvkz.jpg" alt="Receiver Avatar" 
              class="w-12 h-12 rounded-full border-2 border-pink-500 shadow-md">
          <span class="absolute bottom-0 right-0 bg-green-500 rounded-full h-3 w-3 border-2 border-white"></span>
        </div>
        <div class="bg-gray-200 text-gray-900 p-3 rounded-r-lg rounded-bl-lg max-w-xs shadow-md glow-effect">
          <p class="lyric-line">${processedText}</p>
        </div>
      </div>
    `;
    
    messageDiv.innerHTML = messageContent;
    chatContainer.appendChild(messageDiv);
    
    // Auto scroll ke bawah
    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
  }

  // Pantau lagu tiap saat
  audio.addEventListener('timeupdate', function () {
    const currentTime = audio.currentTime;
    
    // Update progress bar
    updateProgress();
    
    // Cek lirik & munculin
    lyrics.forEach((line, index) => {
      const time = line.time;
      
      // Munculin indikator lagi ngetik 1 detik sebelumnya
      if (currentTime >= time - 1 && currentTime < time && !line.isCredit) {
        showTypingIndicator(Math.floor(time), time);
      }
      
      // Munculin pesan atau kredit
      if (currentTime >= time) {
        if (line.isCredit) {
          creditMessage.style.opacity = '1';
        } else if (!document.querySelector(`[data-time='${time}']`)) {
          addChatMessage(line.text, time, line.charDelay);
        }
      }
    });
  });

  // Play/pause button
  playPauseBtn.addEventListener('click', togglePlayPause);

  // Restart button
  restartBtn.addEventListener('click', restartAudio);

  // Pas lagu load
  audio.addEventListener('loadedmetadata', function() {
    durationDisplay.textContent = formatTime(audio.duration);
  });

  // Klik progress bar buat loncat
  progressBar.parentElement.addEventListener('click', function(e) {
    const container = this;
    const rect = container.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    
    // Set posisi lagu
    audio.currentTime = clickPosition * audio.duration;
    
    // Reset chat
    chatContainer.innerHTML = '';
    typingIndicators = [];
    creditMessage.style.opacity = '0';
    
    // Update bar
    updateProgress();
  });

  // Set initial state pada load
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
});