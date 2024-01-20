// openaiService.tsx

import OpenAI from 'openai';

// Initialize the OpenAI client with default values
let apiKey = 'YOUR_DEFAULT_API_KEY'; // Replace with your default API key
let selectedModel = 'GPT-3.5 Turbo'; // Initialize with the default model
let initialSystemPrompt = 'You are chatting with an AI assistant.'; // Initialize with the default system prompt

const openai = new OpenAI({
  apiKey, // Initialize with the default API key
  model: selectedModel, // Initialize with the default model
  dangerouslyAllowBrowser: true,
});

// Function to set the API key dynamically
function setApiKey(newApiKey: string) {
  apiKey = newApiKey;
  openai.config.apiKey = newApiKey; // Update the API key in the OpenAI client
}

// Function to set the selected model
function setModel(newModel: string) {
  selectedModel = newModel;
  openai.config.model = newModel; // Update the selected model in the OpenAI client
}

// Function to set the initial system prompt
function setInitialSystemPrompt(prompt: string) {
  initialSystemPrompt = prompt;
}

// Initialize the conversation with the system prompt
let conversation: OpenAI.Chat.ChatMessage[] = [
  { role: 'system', content: initialSystemPrompt },
];

// Function to add a user message to the conversation
function addUserMessage(userMessage: string) {
  conversation.push({ role: 'user', content: userMessage });
}

// Function to send the conversation to OpenAI and get a response
async function sendConversationToOpenAI(): Promise<string> {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: conversation,
      model: selectedModel, // Adjust the model as needed
    });

    // Extract and return the assistant's reply
    const assistantReply = chatCompletion.choices[0]?.message?.content || '';

    // Add the assistant's reply to the conversation history
    conversation.push({ role: 'assistant', content: assistantReply });

    return assistantReply;
  } catch (error) {
    console.error('Error sending conversation to OpenAI:', error);
    throw error;
  }
}

export { setApiKey, setModel, setInitialSystemPrompt, addUserMessage, sendConversationToOpenAI };
