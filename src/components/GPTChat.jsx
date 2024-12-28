import React, { useState, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { scan } from "rxjs/operators";
import { fetchChatGPTResponse } from "../api/openai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

  const renderMessageContent = (content) => {
    return (
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <Typography paragraph {...props} />,
          code: (props) => (
            <Box
              component="pre"
              sx={{
                backgroundColor: "#f0f0f0",
                padding: "10px",
                borderRadius: "8px",
                overflowX: "auto",
                fontFamily: "monospace",
              }}
            >
              <code {...props} />
            </Box>
          ),
        }}
      />
    );
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        marginTop: 4,
        padding: 2,
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
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
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        {chatHistory.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              marginBottom: 2,
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Box
              sx={{
                padding: "10px",
                borderRadius: "12px",
                backgroundColor: msg.role === "user" ? "#d1e7dd" : "#ffffff",
                border: "1px solid #ddd",
                maxWidth: "70%",
                wordWrap: "break-word",
              }}
            >
              {renderMessageContent(msg.content)}
            </Box>
          </Box>
        ))}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 50,
            }}
          >
            <CircularProgress size={24} />
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
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          disabled={loading}
          sx={{
            padding: "10px 16px",
            borderRadius: "8px",
          }}
        >
          Send
        </Button>
      </form>
    </Container>
  );
};

export default GPTChat;
