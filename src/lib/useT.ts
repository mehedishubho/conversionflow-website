import { useLang } from "@/lib/lang";
import en from "@/messages/en.json";
import bn from "@/messages/bn.json";

const messages = { en, bn } as const;

type Messages = typeof en;

export function useT(): Messages {
  const { lang } = useLang();
  return messages[lang] as Messages;
}
