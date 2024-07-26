import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useLogout } from '../../hooks'; 

export const SideBar = () => {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const mutation = useLogout();

  const Menus = [
    { title: "Home", src: "/assets/home.png", path: "/" },
    { title: "Datasets", src: "/assets/dataset.png", path: "/datasets" },
    { title: "Jobs", src: "/assets/jobs.png", path: "/jobs" },
    { title: "Cluster State", src: "/assets/cluster.png", path: "/cluster_info" },
    { title: "Browse Images", src: "/assets/search.png", path: "/search" },
  ];

  const location = useLocation();

  return (
    <>
      <div className={`fixed top-0 left-0 h-screen p-5 pt-8 bg-dark-purple duration-300 ${open ? "w-60" : "w-20"}`}>
        <div className="flex gap-x-4 items-center">
          <img
            src="/assets/logo.png"
            className={`rounded-full w-10 h-10 cursor-pointer duration-500 ${open && "rotate-[360deg]"}`}
            onClick={() => setOpen(!open)}
          />
          <h1 className={`text-white origin-left font-medium text-xl duration-200 ${!open && "scale-0"}`}>
            StackFull
          </h1>
        </div>
        <ul className="pt-6 flex flex-col justify-between h-full">
          <div>
            {Menus.map((Menu, index) => (
              <Link to={Menu.path} className="flex items-center gap-x-4" key={index}>
                <li
                  className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 ${Menu.gap ? "mt-9" : "mt-2"} ${location.pathname === Menu.path && "bg-light-white"}`}
                >
                  <img src={Menu.src} alt={Menu.title} />
                  <span className={`${!open && "hidden"} origin-left duration-200`}>
                    {Menu.title}
                  </span>
                </li>
              </Link>
            ))}
          </div>
          <div className="mb-8">
            {isAuthenticated ? (
              <div onClick={() => mutation.mutate()} className="flex items-center gap-x-4 cursor-pointer hover:bg-light-white text-gray-300 text-sm p-2 rounded-md">
                <img src="/assets/exit.png" alt="Log Out" />
                <span className={`${!open && "hidden"} origin-left duration-200`}>
                  Log Out
                </span>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-x-4">
                <li
                  className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mt-2`}
                >
                  <img src="/assets/enter.png" alt="Log In" />
                  <span className={`${!open && "hidden"} origin-left duration-200`}>
                    Log In
                  </span>
                </li>
              </Link>
            )}
          </div>
        </ul>
      </div>
      <div className={`relative ${open ? "w-60" : "w-20"} flex-shrink-0 duration-300`}></div>
    </>
  );
};