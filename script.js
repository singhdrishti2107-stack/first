// ========== 1. GET ELEMENTS FROM THE HTML ==========
const apiKeyInput = document.getElementById("apiKey");
const userInput   = document.getElementById("userInput");
const sendBtn     = document.getElementById("sendBtn");
const messagesBox = document.getElementById("messages");

// ========== 2. SETTINGS ==========
const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL   = "gpt-4o-mini";   // you can change the model name here

// This array remembers the whole conversation,
// so ChatGPT can answer follow-up questions.
let chatHistory = [
  { role: "system", content: "You are a helpful assistant." }
];


// ========== 3. FUNCTION: SHOW A MESSAGE ON THE SCREEN ==========
// type can be: "user", "bot" or "error"
function addMessage(text, type) {
  const div = document.createElement("div");   // create a new <div>
  div.classList.add("message", type);          // add CSS classes
  div.textContent = text;                      // put the text inside
  messagesBox.appendChild(div);                // add it to the page

  // scroll to the newest message
  messagesBox.scrollTop = messagesBox.scrollHeight;

  return div;
}


// ========== 4. FUNCTION: SEND MESSAGE TO THE API ==========
async function sendMessage() {
  const apiKey   = apiKeyInput.value.trim();
  const question = userInput.value.trim();

  // --- Validation ---
  if (apiKey === "") {
    addMessage("Please enter your API key first.", "error");
    return;
  }
  if (question === "") {
    return;   // do nothing if the box is empty
  }

  // --- Show the user's message ---
  addMessage(question, "user");
  userInput.value = "";

  // --- Save it in history ---
  chatHistory.push({ role: "user", content: question });

  // --- Show "Thinking..." and disable the button ---
  const thinking = addMessage("Thinking...", "bot");
  sendBtn.disabled = true;

  try {
    // --- Call the API using fetch ---
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatHistory
      })
    });

    // --- Convert the response to a JavaScript object ---
    const data = await response.json();

    // --- If the API returned an error (wrong key, no credit, etc.) ---
    if (!response.ok) {
      thinking.textContent = "Error: " + data.error.message;
      thinking.classList.remove("bot");
      thinking.classList.add("error");
      chatHistory.pop();   // remove the failed question from history
      return;
    }

    // --- Get the answer text from the response ---
    const answer = data.choices[0].message.content;

    // --- Show the answer and save it in history ---
    thinking.textContent = answer;
    chatHistory.push({ role: "assistant", content: answer });

  } catch (error) {
    // This runs if there is no internet or the request fails
    thinking.textContent = "Network error. Please check your internet connection.";
    thinking.classList.remove("bot");
    thinking.classList.add("error");
    chatHistory.pop();

  } finally {
    // This always runs: enable the button again
    sendBtn.disabled = false;
    userInput.focus();
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }
}


// ========== 5. EVENTS ==========
// Click on the Send button
sendBtn.addEventListener("click", sendMessage);

// Press Enter inside the text box
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
