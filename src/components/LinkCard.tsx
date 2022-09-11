import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export function LinkCard({
  title,
  icon,
  url,
}: {
  title: string;
  url: string;
  icon: IconDefinition;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1 border border-gray-600 rounded-md p-2 px-5"
    >
      <FontAwesomeIcon icon={icon} className="mr-1" />
      {title}
    </a>
  );
}
