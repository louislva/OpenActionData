import Head from "next/head";
import Link from "next/link";
import NavBar from "../components/NavBar";
import {
  Card,
  SectionCards,
  SectionSide,
  TitleDivider,
} from "../components/Website";

function InstallButton() {
  return (
    <Link href="/install">
      <button className="rounded-xl bg-stone-800 border-stone-500 text-stone-200 border-2 flex flex-row items-center justify-center px-4 py-3 text-xl unselectable cursor-pointer">
        <div className="material-icons mr-3 text-xl">install_desktop</div>
        Install in Google Chrome
      </button>
    </Link>
  );
}

function PartHero() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 mb-16 mt-12">
      <img
        src="/logo-1080x1080.png"
        alt="OpenActionData - Logo"
        className="w-40 h-40 rounded-xl mb-8 mt-0 pixelated"
      />
      <h1 className="font-cabin text-4xl mb-4 text-center">
        Help teach AIs to use computers
      </h1>
      <p className="max-w-md text-xl text-center mb-6">
        OpenActionData is a chrome extension which asks for{" "}
        <b>2-5 screen recordings per day</b>. Before being uploaded, they're
        fully anonymized - and we'll never save anything without a review from
        you.
      </p>
      <InstallButton />
    </div>
  );
}
function PartWhat() {
  return (
    <>
      <TitleDivider title="OpenActionData" icon="info" />
      <SectionSide
        title="What is it?"
        description={
          <>
            <p>
              OpenActionData is a chrome-extension that identifies tasks that
              are hard for AIs to do. When it sees you doing one, it starts
              recording your mouse-clicks and then asks for your permission to
              upload them to a public dataset.
            </p>
            <p>
              Every browsing session you upload will be consentual & manually
              approved by you.
            </p>
          </>
        }
      >
        <div className="hidden lg:flex justify-center items-center rounded-xl bg-black/10 w-full h-72 ">
          <InstallButton />
        </div>
      </SectionSide>
    </>
  );
}
function PartHow() {
  return (
    <>
      <TitleDivider title="How it works:" icon="tips_and_updates" />
      {/* <TitleDivider title="How it works:" icon="check_box" />
      <TitleDivider title="How it works:" icon="settings" /> */}
      <SectionSide
        title="#1: The extension identifies interesting browsing sessions"
        description={
          <>
            <p>
              The extension will identify when you are doing something that is
              hard for AIs to do, such as:
            </p>
            <ul className="list-disc list-inside">
              <li>Using enterprise software</li>
              <li>Doing research & making conclusions</li>
              <li>Using a new website</li>
            </ul>
          </>
        }
      >
        <>
          <img
            className="w-full h-72 rounded-xl object-contain invert opacity-75"
            src="/art/google-salesforce-linkedin.png"
          />
        </>
      </SectionSide>
      <SectionSide
        title="#2: It records your screen and interactions in the background"
        right
        description={
          <>
            <p>
              You get to review whether the recording is containing any
              sensitive information before we upload it to the dataset.
            </p>
            <p className="underline">
              Nothing is uploaded without your explicit consent.
            </p>
          </>
        }
      >
        <>
          <img
            className="w-full h-72 rounded-xl object-contain opacity-80"
            src="/art/recording-screen-dark.png"
          />
        </>
      </SectionSide>
      <SectionSide
        title="#3: You review the recording and upload it to an open source dataset"
        description={
          <>
            <p>
              The dataset is open source, and anyone can use it to train their
              own AI.
            </p>
            <p>
              The dataset is also available for download, so you can use it to
              train your own AI.
            </p>
          </>
        }
      >
        <>
          <img
            className="w-full h-72 rounded-xl object-contain opacity-80"
            src="/art/video-player.png"
          />
        </>
      </SectionSide>
    </>
  );
}
function PartWhyCrowdsource() {
  return (
    <>
      <TitleDivider title="Why crowdsource?" icon="public" />
      <SectionCards>
        <Card
          name="OPEN SOURCE"
          icon="code"
          title="Fight centralization"
          nameClassName="bg-orange-200 text-black"
        >
          <p className="text-white mb-2">
            As AI becomes more powerful and valuable, it's also becoming
            increasingly centralized.
          </p>
          <p>
            OpenActionData is creating a dataset that anyone can use, putting
            smaller players on equal footing.
          </p>
        </Card>

        <Card
          name="USEFUL AI"
          title="Make AI truly useful"
          icon="mouse"
          nameClassName="bg-orange-200 text-black"
        >
          <p>
            Current AI systems can help writers write or artists draw. But to be
            generally useful, they need to be able to use multiple apps, and
            perform complex tasks.
          </p>
        </Card>

        <Card
          title="A data layer for tool use"
          name="DATA ENGINE"
          icon="rule_folder"
          nameClassName="bg-orange-200 text-black"
        >
          {/* <p>
            Deep learning requires data & compute. In recent years, language
            models such as GPT-3 have shown amazing progress, due to scraping
            massive datasets of text from the web.
          </p> */}
          <p>
            Giant, varied datasets of natural language, code, and images have
            driven recent progress in AI.
          </p>
          <p>
            In order for AI to be truly useful, it needs to use the same tools
            as humans do. No big datasets exist for this. We're aiming to create
            that for future AI systems.
          </p>
        </Card>
      </SectionCards>
    </>
  );
}
function PartStats() {
  return (
    <>
      <TitleDivider title="Numbers" icon="insights" />
      <SectionCards>
        <Card
          name="USERS"
          icon="people"
          title="38,432 people have installed the extension"
          nameClassName="bg-blue-200 text-black"
        >
          <></>
        </Card>
        <Card
          name="SESSIONS"
          icon="history"
          title="1,000,000+ sessions have been recorded"
          nameClassName="bg-blue-200 text-black"
        >
          <></>
        </Card>
        <Card
          name="RAW SIZE"
          icon="storage"
          title="32gb of data has been uploaded"
          nameClassName="bg-blue-200 text-black"
        >
          <></>
        </Card>
      </SectionCards>
    </>
  );
}
function PartTheRoadAhead() {
  return (
    <>
      <TitleDivider title="The road ahead" icon="arrow_circle_right" />
      <SectionSide
        title="Step 1: Train a LLM ✅"
        description={
          <>
            <p>
              Large Language Models (LLMs) serve as a foundation, learning most
              human concepts & basic reasoning skills, by reading the web.
            </p>
            <p>
              There are several open-source LLMs, such as LLaMa, BLOOM, OPT, T5,
              and GPT-J.
            </p>
          </>
        }
      >
        <img
          className="w-full h-72 rounded-xl object-contain invert"
          src="/absurd/bricks.png"
        />
      </SectionSide>
      <SectionSide
        title="Step 2: Fine-tune on humans performing tasks ⌛️"
        description={
          <>
            <p>
              This is where you come in! Big AI companies hire teams of
              contractors to create proprietary datasets, used to teach their
              models to use computers.
            </p>
            <p>
              We're trying to democratize this process. With the help of the
              community, we can create a dataset with more scale and diversity,
              and for a fraction of the cost.
            </p>
          </>
        }
        right
      >
        <img
          className="w-full h-72 rounded-xl object-contain invert"
          src="/absurd/idea-drip.png"
        />
      </SectionSide>
      <SectionSide
        title="Step 3: Iteratively improve model with user feedback ♻️"
        description={
          <>
            <p>
              After the model is trained, you'd use it to perform tasks. Every
              time it makes a mistake, you correct it, and it will iteratively
              improve.
            </p>
            <p>This is how systems such as ChatGPT get as good as they are.</p>
          </>
        }
      >
        <img
          className="w-full h-72 rounded-xl object-contain invert"
          src="/absurd/voting.png"
        />
      </SectionSide>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>OpenActionData - democratizing useful AI</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo-72x72.png" />
      </Head>
      <main
        className={
          "font-dosis min-h-screen bg-stone-900 text-white flex flex-col items-center"
        }
      >
        <NavBar />
        <PartHero />
        <div className="md:max-w-5xl w-full flex flex-col justify-start items-stretch px-8">
          {/* Why crowdsource? */}
          <PartWhyCrowdsource />
          {/* Stats */}
          <PartStats />
          {/* What is it? */}
          <PartWhat />
          {/* How it works */}
          <PartHow />
          {/* The Road Ahead */}
          <PartTheRoadAhead />
          {/* Partners */}
          {/* Team */}
          <PartTeam />
          {/* Contact */}
          {/* <PartContact /> */}
          {/* As featured in */}
          {/* FAQ */}
          {/* Press */}
        </div>
      </main>
    </>
  );
}

function PartTeam() {
  return (
    <>
      <TitleDivider title="Team" icon="people" />
      <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-8 mb-16">
        <div />
        <Person
          imgSrc="/people/louis.jpg"
          name="Louis Arge"
          description="Louis is a person."
        />
        <div />
      </div>
    </>
  );
}
function Person(props: {
  imgSrc: string;
  name: string;
  description: string;
  twitter?: string;
  github?: string;
  website?: string;
}) {
  const { imgSrc, name, description, twitter, github, website } = props;
  return (
    <div className="flex flex-col items-center">
      <img className="w-32 h-32 rounded-xl mb-4" src={imgSrc} />
      <h3 className="text-3xl mb-2">{name}</h3>
      <p className="text-xl text-center">{description}</p>
    </div>
  );
}
