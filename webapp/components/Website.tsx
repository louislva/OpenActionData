export function Card(props: {
  title: string;
  name?: string;
  icon?: string;
  nameClassName?: string;
  children: React.ReactNode;
}) {
  const { title, name, icon, nameClassName, children } = props;

  return (
    <div className="text-lg font-cabin flex-1 bg-stone-800 border-2 border-stone-600 p-4 py-8 text-center rounded-3xl flex flex-col items-center">
      {name && icon && nameClassName && (
        <div
          className={
            "flex flex-row min-w-0 items-center px-2 rounded-lg mb-4 -mt-2 " +
            nameClassName
          }
        >
          <div className="material-icons text-xl">{icon}</div>
          <div className="text-sm font-bold font-dosis leading-none ml-1">
            {name.toUpperCase()}
          </div>
        </div>
      )}
      <h3 className="text-xl font-dosis font-bold text-center mb-2 flex flex-col">
        {title}
      </h3>
      {children}
    </div>
  );
}
export function TitleDivider(props: { title: string; icon?: string }) {
  const { title, icon } = props;

  return (
    <div className="flex flex-row items-center mb-8 px-0">
      {/* dashed borders with large dashes */}
      <div className="border-b-2 border-stone-600 flex-1"></div>
      {icon && <div className="material-icons text-3xl ml-4 -mr-1">{icon}</div>}
      <h2 className="mx-4 text-2xl text-center">{title}</h2>
      <div className="border-b-2 border-stone-600 flex-1"></div>
    </div>
  );
}
export function SectionCards(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      {children}
    </div>
  );
}
export function SectionSide(props: {
  title: string;
  description: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  right?: boolean;
}) {
  const { title, description, children, className, right } = props;

  return (
    <div
      className={
        "flex md:max-w-5xl md:px-8 w-full items-stretch md:items-center justify-center flex-col " +
        (right ? "md:flex-row-reverse " : "md:flex-row ") +
        (className || "mb-16")
      }
    >
      <div className="flex flex-col items-center md:items-start justify-center w-auto md:w-96 text-center md:text-left">
        <h2 className="text-3xl mb-4">{title}</h2>
        <div className="text-lg font-cabin">{description}</div>
      </div>
      <div className="px-8 py-4"></div>
      <div className="flex flex-col items-center justify-center md:flex-1">
        {children}
      </div>
    </div>
  );
}
