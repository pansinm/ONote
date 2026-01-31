// Simple mock for monaco-editor
class Position {
  constructor(public lineNumber: number, public column: number) {}
}

class Range {
  constructor(
    public startLineNumber: number,
    public startColumn: number,
    public endLineNumber: number,
    public endColumn: number,
  ) {}
}

class URI {
  private _path: string = '';
  private _fsPath: string = '';
  private _scheme: string = 'file';
  private _str: string = '';
  private _modified: boolean = false;

  static parse(path: string): URI {
    const uri = new URI();
    try {
      const url = new URL(path);
      uri._path = url.pathname;
      uri._fsPath = url.pathname;
      uri._scheme = url.protocol.replace(':', '');
      if (path.includes('%3A') || path.includes(':/')) {
        const driveMatch = path.match(/file:\/\/\/([a-zA-Z]):/i);
        if (driveMatch) {
          const drive = driveMatch[1].toLowerCase();
          const afterDrive = url.pathname.substring(3);
          uri._str = 'file:///' + encodeURIComponent(drive + ':') + afterDrive;
        } else {
          uri._str = 'file://' + url.pathname;
        }
      } else {
        uri._str = 'file://' + url.pathname;
      }
    } catch {
      const match = path.match(/^(\w+):\/?\/?(.*)$/);
      if (match) {
        uri._scheme = match[1];
        uri._path = '/' + (match[2] || '');
        uri._fsPath = uri._path;
        uri._str = path;
      } else {
        uri._path = path;
        uri._fsPath = path;
        uri._str = path;
      }
    }
    return uri;
  }

  get scheme(): string {
    return this._scheme;
  }

  get fsPath(): string {
    return this._fsPath;
  }

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
    this._modified = true;
  }

  readonly query: string = '';
  readonly fragment: string = '';

  toString(): string {
    if (this._modified) {
      if (this._scheme === 'file') {
        return `file://${this._path}`;
      }
      return `${this._scheme}:${this._path}`;
    }
    return this._str;
  }

  with(changes: any): URI {
    return this;
  }
}

class TextModel {
  private lines: string[] = [];
  private content: string;

  constructor(content: string, language: string, uri: URI) {
    this.content = content;
    this.lines = content.split('\n');
  }

  getLineContent(lineNumber: number): string {
    return this.lines[lineNumber - 1] || '';
  }

  getValueInRange(range: Range): string {
    const startLine = range.startLineNumber;
    const endLine = range.endLineNumber;
    let result = '';
    for (let i = startLine; i <= endLine; i++) {
      const line = this.lines[i - 1] || '';
      if (i === startLine && i === endLine) {
        result += line.slice(range.startColumn - 1, range.endColumn - 1);
      } else if (i === startLine) {
        result += line.slice(range.startColumn - 1);
      } else if (i === endLine) {
        result += line.slice(0, range.endColumn - 1);
      } else {
        result += line;
      }
      if (i < endLine) {
        result += '\n';
      }
    }
    return result;
  }

  getFullModelRange(): Range {
    const lastLine = this.lines.length;
    const lastLineLength = this.lines[lastLine - 1]?.length || 0;
    return new Range(1, 1, lastLine, lastLineLength + 1);
  }

  findPreviousMatch(
    searchString: string,
    position: Position,
    isRegex: boolean,
    matchCase: boolean,
    wordSeparators: string | null,
    captureMatches: boolean,
  ): { range: Range } | null {
    const textBefore = this.getTextBefore(position);
    let matchIndex = -1;
    let matchLength = searchString.length;

    if (isRegex) {
      const regex = new RegExp(searchString, matchCase ? 'g' : 'gi');
      const matches = [...textBefore.matchAll(regex)];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        matchIndex = lastMatch.index || 0;
        matchLength = lastMatch[0].length;
      }
    } else {
      matchIndex = textBefore.lastIndexOf(searchString);
    }

    if (matchIndex !== -1) {
      let currentLine = 1;
      let currentColumn = 1;
      let charCount = 0;

      for (let i = 0; i < this.lines.length; i++) {
        const lineLength = this.lines[i].length + 1;
        if (charCount + lineLength > matchIndex) {
          currentLine = i + 1;
          currentColumn = matchIndex - charCount + 1;
          break;
        }
        charCount += lineLength;
      }

      return {
        range: new Range(currentLine, currentColumn, currentLine, currentColumn + matchLength),
      };
    }
    return null;
  }

  findNextMatch(
    searchString: string,
    position: Position,
    isRegex: boolean,
    matchCase: boolean,
    wordSeparators: string | null,
    captureMatches: boolean,
  ): { range: Range } | null {
    const textAfter = this.getTextAfter(position);
    let matchIndex = -1;
    let matchLength = searchString.length;

    if (isRegex) {
      const regex = new RegExp(searchString, matchCase ? 'g' : 'gi');
      const match = textAfter.match(regex);
      if (match && match.index !== undefined) {
        matchIndex = match.index;
        matchLength = match[0].length;
      }
    } else {
      matchIndex = textAfter.indexOf(searchString);
    }

    if (matchIndex !== -1) {
      let currentLine = position.lineNumber;
      let currentColumn = position.column;
      let charCount = 0;

      for (let i = 0; i < currentLine - 1; i++) {
        charCount += this.lines[i].length + 1;
      }
      charCount += position.column - 1;
      charCount += matchIndex;

      for (let i = 0; i < this.lines.length; i++) {
        const lineLength = this.lines[i].length + 1;
        if (charCount < lineLength) {
          currentLine = i + 1;
          currentColumn = charCount + 1;
          break;
        }
        charCount -= lineLength;
      }

      return {
        range: new Range(currentLine, currentColumn, currentLine, currentColumn + matchLength),
      };
    }
    return null;
  }

  private getTextBefore(position: Position): string {
    let result = '';
    for (let i = 1; i < position.lineNumber; i++) {
      result += this.lines[i - 1] + '\n';
    }
    result += this.lines[position.lineNumber - 1]?.slice(0, position.column - 1) || '';
    return result;
  }

  private getTextAfter(position: Position): string {
    let result = this.lines[position.lineNumber - 1]?.slice(position.column - 1) || '';
    for (let i = position.lineNumber; i < this.lines.length; i++) {
      result += '\n' + this.lines[i];
    }
    return result;
  }

  dispose() {}
}

const editor = {
  createModel(content: string, language: string, uri: URI): TextModel {
    return new TextModel(content, language, uri);
  },
};

// Export as both named exports and default export
export { Position, Range, URI as Uri, URI, editor, TextModel };

// Default export with all properties
export default {
  Uri: URI,
  URI,
  Position,
  Range,
  editor,
  TextModel,
};
