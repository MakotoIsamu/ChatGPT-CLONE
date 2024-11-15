import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  SendHorizontal,
  PanelsTopLeft,
  Plus,
  Loader,
  Mic,
  MicOff,
} from "lucide-react";
import ProfilePic from "../assets/profile.jfif";

const ChatPage = () => {
  const [isChatLandingPage, setIsChatLandingPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isVoiceInput, setVoiceInput] = useState(false); // Track input mode
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const url = "https://chatgpt-42.p.rapidapi.com/gpt4";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = isVoiceInput ? transcript.trim() : message.trim();
    if (!input) return;
    setIsChatLandingPage(false);
    setLoading(true);

    try {
      const options = {
        method: "POST",
        headers: {
          "x-rapidapi-key":
            "1750aa82fdmsh32abc425e232ffbp19dfa2jsnf0ff97e0750e",
          "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: input,
            },
          ],
          web_access: false,
        }),
      };

      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        setChatHistory((prev) => [
          ...prev,
          { message: input, response: data.result },
        ]);
      } else {
        console.error("Failed to fetch response from API");
      }
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setMessage("");
      resetTranscript();
      setLoading(false);
    }
  };

  const toggleInputMode = () => {
    if (isVoiceInput) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening();
    }
    setVoiceInput(!isVoiceInput);
  };

  return (
    <div className="h-screen w-screen p-6 bg-[#212121] flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`h-full fixed top-0 left-0 z-10 w-64 bg-[#171717] text-white transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="cursor-pointer text-white p-4" onClick={toggleSidebar}>
          <PanelsTopLeft />
        </h2>
      </div>

      {/* Main Chat Area */}
      <div className="h-full w-full flex flex-col justify-between items-center text-white">
        {/* Header */}
        <div className="w-full p-4 flex justify-between items-center bg-[#171717] shadow-md">
          <div className="cursor-pointer flex items-center gap-4">
            {!isSidebarOpen && <PanelsTopLeft onClick={toggleSidebar} />}
            <Plus />
          </div>
          <div className="cursor-pointer w-10 h-10 rounded-full overflow-hidden">
            <img
              src={ProfilePic}
              alt="ProfilePic"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
        {isChatLandingPage ? (
          <div className="w-full h-full flex justify-center items-center">
            <h2 className="text-3xl font-bold text-white">
              What can i help you with ?
            </h2>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto flex flex-col gap-4 p-4">
            {chatHistory.map((chat, index) => (
              <div key={index} className="flex flex-col gap-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2 max-w-lg">
                    <span className="block">{chat.message}</span>
                    <span className="text-sm text-gray-300 mt-1 block text-right">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-white px-4 py-2 max-w-screen-lg">
                    <ReactMarkdown className="prose prose-invert">
                      {chat.response}
                    </ReactMarkdown>
                    <span className="text-sm text-gray-500 mt-1 block">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center justify-center text-gray-500 mt-4">
                <Loader className="animate-spin" />
                <span className="ml-2">Loading...</span>
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <form
          className="w-full p-4 flex justify-between items-center gap-2 bg-[#171717] border-t border-gray-800"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={isVoiceInput ? transcript : message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="bg-transparent px-4 py-2 flex-1 outline-none text-white"
            disabled={isVoiceInput}
          />
          <div className="cursor-pointer" onClick={toggleInputMode}>
            {listening ? <MicOff /> : <Mic />}
          </div>
          <button
            type="submit"
            className="text-white flex items-center justify-center"
          >
            {loading ? <Loader className="animate-spin" /> : <SendHorizontal />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
