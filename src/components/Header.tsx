"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Transition, Disclosure } from "@headlessui/react";
import { forwardRef, Fragment, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DAOS } from "@/constants";
import {
  faBars,
  faClose,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MenuLink = forwardRef<
  HTMLAnchorElement,
  { children: ReactNode; href: string; className: string }
>((props, ref) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href} ref={ref} {...rest} prefetch={false}>
      {children}
    </Link>
  );
});
MenuLink.displayName = "MenuLink";

export function Header() {
  const pathname = usePathname();

  const links = [
    "Reactors",
    "Leaderboard",
    "Revenue",
    "Emissions",
    "Stages",
    "Rewards",
  ];

  const navigation = links.map((link) => {
    const href = `/${link.toLowerCase()}`;
    return {
      link,
      href,
      active: pathname?.startsWith(href),
    };
  });

  return (
    <Disclosure as="nav" className="bg-gray-900 sticky top-0 z-10">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link href="/" prefetch={false}>
                  <Image
                    className="cursor-pointer "
                    src="/images/tokewars.png" // Route of the image file
                    height={22} // Desired size with correct aspect ratio
                    width={160} // Desired size with correct aspect ratio
                    alt="Toke Wars Logo"
                    draggable={false}
                  />
                </Link>

                <div className="hidden md:block">
                  <div className="ml-5 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.link}
                        href={item.href}
                        prefetch={false}
                        className={`px-2 py-2 rounded-md text-sm font-medium ${
                          item.active
                            ? "bg-gray-800 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                        aria-current={item.active ? "page" : undefined}
                      >
                        {item.link}
                      </Link>
                    ))}

                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button
                          className="inline-flex w-full justify-center rounded-md border border-gray-700 bg-gray-800
                            px-4 py-2 text-sm font-medium  shadow-sm
                            hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                        >
                          DAOs
                          <FontAwesomeIcon
                            icon={faCaretDown}
                            className="ml-1 self-center"
                          />
                        </Menu.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          className="absolute right-0 z-10 mt-2 w-56 origin-top-right
                            rounded-md bg-gray-900 shadow-lg border border-gray-700
                            ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <div className="py-1">
                            {DAOS.map(({ name }) => (
                              <Menu.Item key={name}>
                                {({ active }) => (
                                  <MenuLink
                                    href={`/dao/${name}`}
                                    className={`block px-4 py-2 text-sm ${
                                      active ? "bg-gray-800 " : ""
                                    }`}
                                  >
                                    {name}
                                  </MenuLink>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>

              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="mr-2 inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <FontAwesomeIcon icon={faClose} width={15} />
                  ) : (
                    <FontAwesomeIcon icon={faBars} width={15} />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  as="a"
                  key={item.link}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    item.active
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.link}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 pb-3">
              <div className="flex items-center px-5">DAOs</div>
              <div className="mt-3 space-y-1 px-2">
                {DAOS.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={`/dao/${item.name}`}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
