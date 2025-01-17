import axios from "axios";

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
  },
});

export const fetchChatGPTResponse = async (messages) => {
  if (!Array.isArray(messages) || messages.some((msg) => typeof msg !== "object")) {
    throw new Error("Invalid messages array: must be an array of objects with 'role' and 'content'.");
  }

  console.log(messages)
  try {
    const response = await openai.post("/chat/completions", {
      model: "gpt-4o", // Use "gpt-4" or "gpt-3.5-turbo"
      messages: messages,
      temperature: 0.7,
      max_tokens: 100,
    });

    // Extract and return the assistant's content
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching GPT response:", error.response?.data || error.message);
    throw error;
  }
};
