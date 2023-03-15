# OpenActionData

Building a diverse & clean dataset of humans using the web. Open source.

For training models similar to [ACT-1](https://www.adept.ai/act), [WebGPT](https://openai.com/blog/webgpt/), or [DeepMind's Unnamed Thing](https://arxiv.org/abs/2202.08137).

## Contributing

Check [the issues](https://github.com/louislva/OpenActionData/issues) to find something to work on - or create an issue if there's something you find important.

## Structure

- [`chrome-extension`](https://github.com/louislva/OpenActionData/tree/master/chrome-extension): A chrome extension with rrweb (library for recording sessions of DOM changes) & react installed
- [`webapp`](https://github.com/louislva/OpenActionData/tree/master/mock-backend): A Next.js app that implements the backend + landing page

## Development environment

In `chrome-extension`:

1. Install dependencies with `npm install`
2. Run `npm run watch` and `npm run watch-tailwind` in separate terminals

In `webapp`:

1. Install dependencies with `npm install`
2. Run `npm run dev`
