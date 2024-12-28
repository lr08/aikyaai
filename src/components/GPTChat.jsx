import React, { useState, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { scan } from "rxjs/operators";
import { fetchChatGPTResponse } from "../api/openai";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Container,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

// Reactive stream for chat messages
const messageSubject = new BehaviorSubject([]);

const GPTChat = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // Subscribe to updates in chat history
  useEffect(() => {
    const subscription = messageSubject
      .pipe(scan((acc, curr) => [...acc, curr], [])) // Accumulate messages over time
      .subscribe(setChatHistory);

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);

    try {
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userInput },
      ];

      // Add user message to the reactive stream
      messageSubject.next({ role: "user", content: userInput });

      setUserInput("");

      // Call the API
      const result = await fetchChatGPTResponse(messages);

      // Add AI response to the reactive stream
      messageSubject.next({ role: "assistant", content: result });

      setResponse(result);
    } catch (error) {
      console.error("Error:", error);
      messageSubject.next({
        role: "assistant",
        content: "Error fetching response. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4, padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        AI Chat
      </Typography>
      <Paper
        elevation={3}
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          padding: 2,
          marginBottom: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        {chatHistory.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              marginBottom: 2,
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: msg.role === "user" ? "#d1e7dd" : "#fff",
                border:
                  msg.role === "user"
                    ? "1px solid #badbcc"
                    : "1px solid #ddd",
                maxWidth: "80%",
                wordWrap: "break-word",
              }}
            >
              {msg.content}
            </Typography>
          </Box>
        ))}
        {loading && (
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Paper>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          disabled={loading}
        >
          Send
        </Button>
      </form>
    </Container>
  );
};

export default GPTChat;
