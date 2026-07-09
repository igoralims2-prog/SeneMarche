import { formatPrix } from "@/lib/utils";

type PrixFormatProps = {
  montant: number;
  devise?: string;
  className?: string;
};

export function PrixFormat({ montant, devise = "XOF", className }: PrixFormatProps) {
  return <span className={className}>{formatPrix(montant, devise)}</span>;
}
