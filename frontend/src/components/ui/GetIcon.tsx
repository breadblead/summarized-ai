import { CheckIcon } from "@/components/ui/CheckIcon";
import { ClockIcon } from "@/components/ui/ClockIcon";
import { CloudIcon } from "@/components/ui/CloudIcon";

export function GetIcon(name: string) {
  switch (name) {
    case "CLOCK_ICON":
      return <ClockIcon className="w-12 h-12 mb-4 text-gray-900" />;
    case "CHECK_ICON":
      return <CheckIcon className="w-12 h-12 mb-4 text-gray-900" />;
    case "CLOUD_ICON":
      return <CloudIcon className="w-12 h-12 mb-4 text-gray-900" />;
    default:
      return null;
  }
}
