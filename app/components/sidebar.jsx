'use client';

import { assets } from '@/assets/assets';
import Image from 'next/image';
import React, { useState } from 'react';
import { useClerk, UserButton } from '@clerk/nextjs';
import { useAppContext } from '../context/AppContext';
import ChatLable from './ChatLable';

function Sidebar({ expand, setExpand }) {
  const { openSignIn } = useClerk();
  const { user, chats, createNewChat } = useAppContext(); //  fixed function name
  const [openMenu, setOpenMenu] = useState({ id: 0, open: false });

  return (
    <div
      className={`flex flex-col justify-between bg-[#212327] pt-7 transition-all duration-300 z-50 max-md:absolute max-md:h-screen ${
        expand ? 'p-4 w-64' : 'w-20'
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Logo + Toggle */}
        <div
          className={`flex ${
            expand ? 'flex-row gap-10' : 'flex-col items-center gap-8'
          }`}
        >
          <Image
            className={expand ? 'w-36' : 'w-10'}
            src={expand ? assets.logo_text : assets.logo_icon}
            alt="Logo"
          />
          <div
            onClick={() => setExpand(!expand)}
            className="group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 rounded-lg cursor-pointer"
          >
            <Image
              src={assets.menu_icon}
              alt="Menu icon"
              className="md:hidden"
            />
            <Image
              src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
              alt="Toggle Sidebar"
              className="hidden md:block w-7"
            />
            <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
              {expand ? 'Close Sidebar' : 'Open Sidebar'}
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewChat} //  fixed
          className={`mt-8 flex items-center justify-center cursor-pointer ${
            expand
              ? 'bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-max'
              : 'group relative h-9 w-9 mx-auto hover:bg-gray-500/20 rounded-lg'
          }`}
        >
          <Image
            className={expand ? 'w-6' : 'w-7'}
            src={expand ? assets.chat_icon : assets.chat_icon_dull}
            alt="Chat icon"
          />
          {!expand && (
            <div className="absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
              New chat
              <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
            </div>
          )}
          {expand && <div className="text-white font-medium">New chat</div>}
        </button>

        {/* Recents */}
        {expand && (
          <div className="mt-8 text-white/25 text-sm">
            <p className="my-1">Recents</p>
            {chats.map((chat) => (
              <ChatLable
                key={chat.id} //  required
                name={chat.name}
                id={chat.id}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div>
        {/* Get App */}
        <div
          className={`flex items-center cursor-pointer group relative ${
            expand
              ? 'gap-1 text-white/80 text-sm p-2.5 border border-primary rounded-lg hover:bg-white/10'
              : 'h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg'
          }`}
        >
          <Image
            className={expand ? 'w-5' : 'w-6 mx-auto'}
            src={expand ? assets.phone_icon : assets.phone_icon_dull}
            alt="Phone icon"
          />
          {/* Tooltip with QR */}
          <div
            className={`absolute -top-16 pb-8 ${
              !expand ? '-right-40' : ''
            } opacity-0 group-hover:opacity-100 transition pointer-events-none`}
          >
            <div className="relative w-max bg-black text-white text-sm p-3 rounded-lg shadow-lg">
              <Image src={assets.qrcode} alt="QR code" className="w-44" />
              <p>Scan to get Deepseek App</p>
              <div
                className={`w-3 h-3 absolute bg-black rotate-45 ${
                  expand ? 'right-1/2 -bottom-1.5' : 'left-4 -bottom-1.5'
                }`}
              ></div>
            </div>
          </div>

          {expand && (
            <>
              <span>Get App</span>
              <Image alt="New icon" src={assets.new_icon} />
            </>
          )}
        </div>

        {/* Profile */}
        <div
          onClick={user ? null : openSignIn}
          className={`flex items-center ${
            expand ? 'hover:bg-white/10 rounded-lg' : 'justify-center w-full'
          } gap-3 text-white/60 text-sm p-2 mt-2 cursor-pointer`}
        >
          {user ? (
            <UserButton />
          ) : (
            <Image
              src={assets.profile_icon}
              alt="Profile icon"
              className="w-7"
            />
          )}
          {expand && <span>My Profile</span>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
