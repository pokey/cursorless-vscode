import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import Button from '../components/Button';
import { ReactComponent as Logo } from './svg/logo.svg';

export default function LandingPage() {
  return (
    <main className="items-center justify-center bg-salmon-100 dark:bg-salmon-900 text-salmon-900 dark:text-salmon-300 overflow-auto fixed top-0 bottom-0 left-0 right-0 p-2 sm:px-16 sm:pt-16 sm:pb-4 font-mono">
      <div className="h-full sm:h-fit flex flex-col max-w-[1000px] mx-auto">
        <div className="flex-1 flex flex-col">
          <header className="flex flex-row items-center sm:mb-[39px]">
            <div className="mr-auto text-2xl sm:text-[32px] sm:leading-[34px] font-semibold dark:font-medium sm:font-medium tracking-[0.3em] sm:tracking-[0.24em] uppercase">
              Cursorless
            </div>
            <Logo
              title="Logo"
              className="align-middle scale-[0.961] sm:scale-[1.2] sm:mt-[0.5em]"
            />
          </header>
          <Slogan />
        </div>
        <div className="border border-salmon-300 sm:border-salmon-100 rounded-sm p-[1px] sm:mb-8">
          <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row justify-around sm:justify-center w-full my-auto sm:mb-6 sm:gap-32">
            <Button text="Start" href="/docs" isExternal={true} />{' '}
            <Button
              text="Donate"
              href="https://github.com/sponsors/pokey"
              isExternal={true}
            />
          </div>
          <NetlifyFooter />
        </div>
      </div>
    </main>
  );
}

function Slogan() {
  return (
    <h1 className="text-[22px] sm:text-sm leading-6 sm:leading-normal font-semibold dark:font-medium sm:font-medium tracking-[0.06em] sm:tracking-[0.24em] text-black dark:text-salmon-100 text-center my-auto sm:mb-[45px]">
      <span className="inline-block">Voice coding at the</span>{' '}
      <span className="inline-block">speed of thought.</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-salmon-800 dark:text-salmon-100 dark:sm:text-salmon-300 text-sm sm:text-xs tracking-widest ">
      This site is powered by{' '}
      <a
        href="https://www.netlify.com/"
        target="_blank"
        className="text-salmon-400 dark:text-salmon-300 dark:sm:text-salmon-400 hover:text-purple-500 "
        rel="noreferrer"
      >
        Netlify
      </a>
      .
    </footer>
  );
}
