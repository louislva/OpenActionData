import Link from "next/link";

export default function NavBar() {
  return (
    <div className="w-full flex flex-row items-center p-6 text-xl">
      <h1>OpenActionData</h1>
      <div className="flex-1"></div>
      <Link
        href="https://github.com/louislva/OpenActionData"
        // new tab
        target="_blank"
        className="text-white ml-8 underline"
      >
        Github
      </Link>
      <Link href="/install" className="text-white ml-8 underline">
        Install
      </Link>
    </div>
  );
}
