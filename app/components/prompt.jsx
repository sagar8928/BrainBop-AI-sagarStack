'use client';

import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useApi } from '@/app/lib/api';

function PromptBox({ isLoading, setIsLoading }) {
  const [prompt, setPrompt] = useState('');
  const { user, chats, setChats, selectedChat, setSelectedChat } =
    useAppContext();

  const api = useApi();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    e.preventDefault();

    if (!user) return toast.error('Login first');
    if (!selectedChat) return toast.error('No chat selected');
    if (!prompt.trim()) return;
    if (isLoading) return toast.error('Wait for previous message');

    setIsLoading(true);

    const promptCopy = prompt.trim();
    setPrompt('');

    const userMessage = {
      role: 'user',
      content: promptCopy,
      timestamp: Date.now(),
    };

    // UPDATE: add user message locally
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );
    setSelectedChat((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    try {
      const { data } = await api.post('/api/chat/ai', {
        chatId: selectedChat.id,
        prompt: promptCopy,
      });

      if (!data || !data.success || !data.response) {
        throw new Error('Invalid response');
      }

      const aiMessage = data.response;

      // Add empty assistant message for typing effect
      let assistant = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id
            ? { ...c, messages: [...c.messages, assistant] }
            : c
        )
      );

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, assistant],
      }));

      // Typing animation
      const words = aiMessage.content.split(' ');

      words.forEach((_, i) => {
        setTimeout(() => {
          setSelectedChat((prev) => {
            const updated = [...prev.messages];
            updated[updated.length - 1].content = words
              .slice(0, i + 1)
              .join(' ');
            return { ...prev, messages: updated };
          });
        }, i * 60);
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to get response');
    }

    setIsLoading(false);
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        selectedChat?.messages?.length > 0 ? 'max-w-3xl' : 'max-w-2xl'
      } bg-[#404045] p-4 rounded-3xl mt-4`}
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message BrainBop"
        className="outline-none w-full resize-none bg-transparent"
        rows={2}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border px-2 py-1 rounded-full">
            <Image className="h-5" src={assets.deepthink_icon} alt="" />{' '}
            DeepThink
          </p>
          <p className="flex items-center gap-2 text-xs border px-2 py-1 rounded-full">
            <Image className="h-5" src={assets.search_icon} alt="" /> Search
          </p>
        </div>

        <button
          type="submit"
          className={`${
            prompt ? 'bg-primary' : 'bg-[#71717a]'
          } rounded-full p-2`}
        >
          <Image
            className="w-3.5"
            src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
            alt=""
          />
        </button>
      </div>
    </form>
  );
}

export default PromptBox;
