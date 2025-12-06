import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative">
      {/* NAVBAR CONTAINER */}
      <div className="flex items-center justify-between m-2 p-3 bg-custom8 rounded">
        
        {/* LOGO */}
        <p className="text-white font-bold text-xl">PLANTRA</p>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-10 text-white">
          <li className="cursor-pointer">Home</li>
          <li className="cursor-pointer">Services</li>
          <li className="cursor-pointer">About Us</li>
          <li className="cursor-pointer">Contact Us</li>
        </ul>

        {/* DESKTOP BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          <button className="bg-custom2 px-4 py-1 rounded-full">Signup</button>
          <button className="bg-custom7 px-4 py-1 rounded-full text-white">Signin</button>
        </div>

        {/* MOBILE MENU ICON */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {open && (
        <div className="md:hidden bg-custom8 mx-2 p-4 rounded mt-2 text-white space-y-4">
          <ul className="space-y-4">
            <li className="cursor-pointer">Home</li>
            <li className="cursor-pointer">Services</li>
            <li className="cursor-pointer">About Us</li>
            <li className="cursor-pointer">Contact Us</li>
          </ul>

          <div className="flex flex-col gap-3 pt-4">
            <button className="bg-custom2 py-2 rounded-full">Signup</button>
            <button className="bg-custom7 py-2 rounded-full text-white">Signin</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
