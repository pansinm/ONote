import type { Plugin } from 'unified';

const FENCE_CHAR = ':'.charCodeAt(0);
const CR = -5;
const LF = -4;
const CRLF = -3;
const HT = -2;
// Virtual space
const VS = -1;
const EOF = null;

// -5 — M-0005 CARRIAGE RETURN (CR)
// -4 — M-0004 LINE FEED (LF)
// -3 — M-0003 CARRIAGE RETURN LINE FEED (CRLF)
// null — EOF (end of the stream)

function variableTokenize(effects: any, ok: any, nok: any) {
  return start;

  function start(code: number) {
    effects.enter('emoji');
    effects.enter('emojiMarker');
    effects.consume(code);
    effects.exit('emojiMarker');
    effects.enter('emojiName');
    return begin;
  }

  function begin(code: number) {
    return code === FENCE_CHAR ? nok(code) : inside(code);
  }

  function inside(code: number) {
    if ([CR, LF, CRLF, EOF].includes(code)) {
      return nok(code);
    }

    if (code === FENCE_CHAR) {
      effects.exit('emojiName');
      effects.enter('emojiMarker');
      effects.consume(code);
      effects.exit('emojiMarker');
      effects.exit('emoji');
      return ok(code);
    }

    effects.consume(code);
    return inside;
  }
}

export default (function remarkEmoji() {
  const data = this.data();

  add('micromarkExtensions', {
    text: {
      [FENCE_CHAR]: {
        name: 'emoji',
        tokenize: variableTokenize,
      },
    },
  });
  add('fromMarkdownExtensions', {
    enter: {
      emoji: function (this: any, token: any) {
        this.enter(
          {
            type: 'emoji',
            name: this.sliceSerialize(token).slice(1, -1),
            children: [],
          },
          token,
        );
      },
    },
    exit: {
      emoji: function (this: any, token: any) {
        this.exit(token);
      },
    },
  });

  function add(field: string, value: unknown) {
    const list: unknown[] = data[field]
      ? (data[field] as unknown[])
      : (data[field] = []);

    list.push(value);
  }
} as Plugin);
