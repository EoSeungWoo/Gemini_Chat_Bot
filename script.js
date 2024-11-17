let apiKey = '';
let chatHistoryArray = []; // 대화 내용을 저장할 배열

document.getElementById('sendApiKey').addEventListener('click', () => {
    apiKey = document.getElementById('apiKey').value;
    alert('API Key가 저장되었습니다.');
});

document.getElementById('sendButton').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;
    const chatHistory = document.getElementById('chatHistory');
    
    if (!userInput.trim()) return; // 빈 입력 방지

    // 사용자 메시지 표시
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userInput;
    chatHistory.appendChild(userMessageDiv);
    
    // 대화 내용 배열에 사용자 메시지 추가
    chatHistoryArray.push({ role: 'user', parts: [{ text: userInput }] });
    
    // 로딩 표시
    const loadingMessageDiv = document.createElement('div');
    loadingMessageDiv.className = 'message bot-message';
    loadingMessageDiv.textContent = "응답을 기다리는 중...";
    chatHistory.appendChild(loadingMessageDiv);
    
    // 스크롤을 맨 아래로
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    ...chatHistoryArray, // 이전 대화 내용을 포함
                    {
                        role: 'user',
                        parts: [{ text: userInput }]
                    }
                ]
            })
        });

        const data = await response.json();

        // 로딩 메시지 제거
        chatHistory.removeChild(loadingMessageDiv);

        // 응답 데이터가 유효한지 확인
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
            const botResponse = data.candidates[0].content.parts[0].text; // 응답 텍스트
            const botResponseDiv = document.createElement('div');
            botResponseDiv.className = 'message bot-message';
            botResponseDiv.textContent = botResponse; // 응답 텍스트 표시
            chatHistory.appendChild(botResponseDiv);
            
            // 대화 내용 배열에 봇 응답 추가
            chatHistoryArray.push({ role: 'model', parts: [{ text: botResponse }] });
        } else {
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.className = 'message bot-message';
            errorMessageDiv.textContent = "응답 형식이 올바르지 않습니다.";
            chatHistory.appendChild(errorMessageDiv);
        }
    } catch (error) {
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'message bot-message';
        errorMessageDiv.textContent = "오류 발생: " + error.message;
        chatHistory.appendChild(errorMessageDiv);
    }

    // 입력 필드 초기화
    document.getElementById('userInput').value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight; // 스크롤을 맨 아래로
});
