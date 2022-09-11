import { faTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const SocialButton = ({
  href,
  icon,
  label,
}: {
  icon: IconDefinition;
  label: string;
  href: string;
}) => {
  return (
    <a
      href={href}
      title={label}
      className="bg-gray-800 p-1 px-2 rounded-full"
      target="_blank"
      rel="noreferrer"
    >
      <FontAwesomeIcon icon={icon} />
    </a>
  );
};

export function Footer() {
  return (
    <footer className="bg-gray-900 ">
      <div className="p-3 container flex justify-between items-center mx-auto">
        <a href="https://www.tokebase.xyz/" target="_blank" rel="noreferrer">
          Tokebase
        </a>
        <div className="flex space-x-2">
          <SocialButton
            icon={faTwitter}
            label="Twitter"
            href="https://twitter.com/tokebase"
          />
          <SocialButton
            icon={faYoutube}
            label="YouTube"
            href="https://www.youtube.com/channel/UCCrMQKsLLstyVeEodicKbjg"
          />
        </div>
      </div>
    </footer>
  );
}
