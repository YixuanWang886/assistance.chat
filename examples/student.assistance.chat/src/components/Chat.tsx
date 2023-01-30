// Copyright (C) 2023 Assistance.Chat contributors

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  useState,
  useContext,
  MouseEvent,
  ChangeEvent,
  FormEvent,
} from "react";
import { Transition } from "@headlessui/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

import {
  ChatContext,
  MessageHistoryItem,
  ChatContextData,
} from "@/contexts/chat";

import ellipsis from "@/images/ellipsis.svg";

const epochToTimestamp = (epoch: number) => {
  const date = new Date(epoch);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const mostRecentChatIsUser = (chatData: ChatContextData) => {
  const messageHistory = chatData.messageHistory;
  const mostRecentChatItem = messageHistory[messageHistory.length - 1];
  return mostRecentChatItem.originator === "user";
};

function ChatHistory() {
  const { chatData } = useContext(ChatContext);

  const renderChatHistory = () => {
    return chatData.messageHistory.map(
      ({ message, originator, timestamp }, index) => {
        const timestampAsString = epochToTimestamp(timestamp);
        const name = chatData.originatorNames[originator];
        const profilePictureUrl =
          chatData.originatorProfilePictureUrls[originator];

        return (
          <div
            key={index}
            className={`flex ${
              originator === "user" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">
                  {timestampAsString}
                </span>
                <span className="text-xs text-gray-400">{name}</span>
              </div>
              <div className="flex flex-col items-end">
                <div
                  className={`py-2 px-4 rounded-xl rounded-br-none ${
                    originator === "user"
                      ? "bg-orange-300 text-white"
                      : "bg-gray-800 text-white"
                  } max-w-xs`}
                >
                  {message}
                </div>
                <img
                  className="w-6 h-6 rounded-full -mt-3"
                  src={profilePictureUrl}
                  alt={name}
                />
              </div>
            </div>
          </div>
        );
      }
    );
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="flex flex-col-reverse h-full">
        {renderChatHistory()}
        <Transition
          show={mostRecentChatIsUser(chatData)}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="flex justify-end mb-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">...</span>
                <span className="text-xs text-gray-400">user</span>
              </div>
              <div className="flex flex-col items-end">
                <div className="py-2 px-4 rounded-xl rounded-br-none bg-blue-600 text-white max-w-xs">
                  <img src={ellipsis} className="w-4 h-4" alt="ellipsis" />
                </div>
                <img
                  className="w-6 h-6 rounded-full -mt-3"
                  src="https://www.w3schools.com/howto/img_avatar2.png"
                  alt="user"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}

function ChatInput() {
  const { chatData, setChatData } = useContext(ChatContext);
  const [message, setMessage] = useState("");

  const addNewMessage = (message: string) => {
    const newMessageHistoryItem: MessageHistoryItem = {
      originator: "user",
      message: message,
      timestamp: Date.now(),
    };

    const updatedMessageHistory = [
      ...chatData.messageHistory,
      newMessageHistoryItem,
    ];

    setChatData({ ...chatData, messageHistory: updatedMessageHistory });
  };

  const handleMessageInput = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleMessageSubmit = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addNewMessage(message);
    setMessage("");
  };

  // Not sure why this is needed.
  const preventFormSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200">
      <form className="flex w-full" onSubmit={preventFormSubmission}>
        <div className="flex w-full items-center">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500"
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageInput}
          />
          <button
            type="submit"
            className="ml-4"
            onClick={handleMessageSubmit}
            disabled={message === "" || mostRecentChatIsUser(chatData)}
          >
            <PaperAirplaneIcon className="w-6 h-6 text-blue-500" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Chat() {
  return (
    <div className="flex flex-col flex-1 h-full">
      <ChatHistory />
      <ChatInput />
    </div>
  );
}

export default Chat;