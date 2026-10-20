export const SectionHeading = (props: {
  title: string;
  subtitle?: string;
}) => (
  <div className="mx-auto max-w-2xl text-center">
    <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
      {props.title}
    </h2>
    {props.subtitle ? (
      <p className="mt-4 text-lg text-muted-foreground">{props.subtitle}</p>
    ) : null}
  </div>
);
