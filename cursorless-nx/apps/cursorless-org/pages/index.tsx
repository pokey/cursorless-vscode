import { EmbeddedVideo } from '@cursorless/react/embedded-video';
import Button from '../components/Button';
import { ReactComponent as Logo } from './svg/logo.svg';

export default function LandingPage() {
  return (
    <main className="items-center justify-center bg-salmon-100 dark:bg-salmon-900 text-salmon-900 dark:text-salmon-100 overflow-auto fixed top-0 bottom-0 left-0 right-0 p-2 sm:px-16 sm:pt-16 sm:pb-4 font-mono">
      <div className="h-full flex flex-col max-w-[1000px] mx-auto">
        <div className="flex-1 flex flex-col">
          <header className="flex flex-row items-center ">
            <div className="mr-auto text-2xl sm:text-[32px] sm:leading-[34px] font-semibold dark:font-medium sm:font-medium tracking-[0.3em] sm:tracking-[0.24em] uppercase">
              Cursorless
            </div>
            <Logo
              title="Logo"
              className="align-middle scale-[0.961] sm:scale-[1.333]"
            />
          </header>
          <Slogan />
        </div>
        <div className="border-[0.5px] border-salmon-100 sm:border-salmon-100 p-[1px]">
          <EmbeddedVideo youtubeSlug="5mAzHGM2M0k" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex flex-row justify-around sm:justify-center w-full my-auto sm:gap-32">
            <Button text="Start" href="/docs" isExternal={false} />{' '}
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
    <h1 className="text-[22px] sm:text-[20px] leading-6 sm:leading-normal font-semibold dark:font-bold sm:font-bold sm:font-monosemiexpanded uppercase [font-stretch:112.5%] tracking-[0.06em] sm:tracking-[0.24em] text-black dark:text-salmon-100 text-center my-auto">
      <span className="inline-block">Voice coding</span>{' '}
      <span className="inline-block">at the speed of thought</span>
    </h1>
  );
}

function NetlifyFooter() {
  return (
    <footer className="text-center text-salmon-800 dark:text-salmon-100 text-sm sm:text-xs tracking-widest sm:font-light">
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
