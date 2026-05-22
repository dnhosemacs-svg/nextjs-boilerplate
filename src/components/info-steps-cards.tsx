import PresentationStepCards, {
  type PresentationStepItem,
} from "@/components/presentation-step-cards";

type InfoStepsCardsProps = {
  steps: { title: string; detail: string }[];
};

export default function InfoStepsCards({ steps }: InfoStepsCardsProps) {
  const items: PresentationStepItem[] = steps.map((step) => ({
    key: step.title,
    title: step.title,
    body: step.detail,
  }));

  return <PresentationStepCards items={items} />;
}
