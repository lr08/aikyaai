import React, { useState } from "react";
import { fetchChatGPTResponse } from "../api/openai";

const GPTChat = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userInput },
      ];
      const result = await fetchChatGPTResponse(messages);
      setResponse(result); // Set the fetched response
    } catch (error) {
      setResponse("Error fetching response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>AI Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask something..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{
            width: "300px",
            padding: "10px",
            marginBottom: "10px",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
      {response && (
        <div style={{ marginTop: "20px", fontSize: "18px" }}>
          <strong>Response:</strong> {response}
        </div>
      )}
    </div>
  );
};

export default GPTChat;
