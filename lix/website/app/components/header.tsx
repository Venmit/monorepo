import IconDiscord from "./icons/discord";
import IconGitHub from "./icons/github";
import IconLix from "./icons/lix";
import IconX from "./icons/x";

const socialLinks = [
  {
    href: "https://github.com/opral/monorepo",
    icon: <IconGitHub />,
  },
  {
    href: "https://discord.gg/gdMPPWy57R",
    icon: <IconDiscord />,
  },
  {
    href: "https://x.com/lixCCS",
    icon: <IconX />,
  },
];

const Header = () => {
  return (
    <header className="w-full max-w-5xl px-4 py-3 mx-auto flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <IconLix />
        <a
          className="px-2 py-1 font-medium text-zinc-500 hover:text-cyan-600 bg-white"
          href="https://opral.substack.com">
          Blog
        </a>
      </div>
      <div className="flex items-center gap-4">
        {socialLinks.map((socialLink, index) => (
          <a
            key={index}
            className="p-2 text-black hover:text-cyan-600"
            href={socialLink.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {socialLink.icon}
          </a>
        ))}
      </div>
    </header >
  );
}

export default Header;