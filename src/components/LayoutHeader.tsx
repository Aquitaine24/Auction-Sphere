// DashboardHeader.tsx

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebaseconfig";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/app-logo.png";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const userNavigation = [
  { name: "Your Profile", href: "/profile" },
  { name: "Settings", href: "#" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("Loading...");
  const [email, setEmail] = useState("Loading...");
  const [profileimg, setImg] = useState(
    "https://www.pngall.com/wp-content/uploads/14/Loading-PNG-Photo.png"
  );

  const user = {
    displayName: username,
    email: email,
    imageUrl: profileimg,
  };

  const navigation = [
    {
      name: "Home",
      href: "/home",
      current: location.pathname === "/home",
    },
    {
      name: "Auctions",
      href: "/list",
      current: location.pathname === "/list",
    },
    {
      name: "Sell",
      href: "/create",
      current: location.pathname === "/create",
    },
    {
      name: "Messages",
      href: "/conversations",
      current: location.pathname === "/create",
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
      } else {
        console.log("User is signed in:", user);
        setUsername(user.displayName || "Unknown User");
        setEmail(user.email || "Unknown Email");

        // Fetch the user's profile image from Firebase Storage
        const storage = getStorage();
        try {
          if (user.photoURL) {
            setImg(user.photoURL);
          } else {
            const imageRef = ref(storage, `profile_pictures/${user.uid}`);
            const url = await getDownloadURL(imageRef);
            setImg(url);
          }
        } catch (error) {
          console.error("Error loading profile image:", error);
          setImg(
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
          );
        }
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigate]);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-gray-900">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left section */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img alt="App Logo" src={logo} className="h-10 w-10" />
              </div>
              {/* Navigation links */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={classNames(
                        item.current
                          ? "bg-gray-800 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {/* Right section */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                      <img
                        alt=""
                        src={user.imageUrl}
                        className="h-8 w-8 rounded-full"
                      />
                    </MenuButton>
                  </div>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        {({ active }) => (
                          <a
                            href={item.href}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            {item.name}
                          </a>
                        )}
                      </MenuItem>
                    ))}
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(
                            active ? "bg-gray-100" : "",
                            "block w-full text-left px-4 py-2 text-sm text-gray-700"
                          )}
                        >
                          Logout
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <DisclosureButton className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                <XMarkIcon className="hidden h-6 w-6" aria-hidden="true" />
              </DisclosureButton>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <DisclosurePanel className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className={classNames(
                  item.current
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
          <div className="border-t border-gray-700 pb-3 pt-4">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img
                  alt=""
                  src={user.imageUrl}
                  className="h-10 w-10 rounded-full"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">
                  {user.displayName}
                </div>
                <div className="text-sm font-medium leading-none text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              {userNavigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {item.name}
                </DisclosureButton>
              ))}
              <DisclosureButton
                as="button"
                onClick={handleLogout}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </DisclosureButton>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>

      {/* Main content area */}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Your content */}
        </div>
      </main>
    </div>
  );
}
