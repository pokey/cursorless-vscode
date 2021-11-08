import { TextDocument } from "vscode";
import { HatStyleName } from "./constants";
import { Graph, Token } from "../typings/Types";
import { mkdir, stat } from "fs/promises";
import { join } from "path";
import { Signal } from "../util/getExtensionApi";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export default class NavigationMap {
  activeMap: IndividualNavigationMap;
  mapSnapshot?: IndividualNavigationMap;

  phraseStartSignal: Signal | null = null;
  lastSignalVersion?: string;

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);
    this.activeMap = new IndividualNavigationMap(graph);
    this.phraseStartSignal = graph.commandServerApi?.signals.prePhrase ?? null;
  }

  static getKey(hatStyle: HatStyleName, character: string) {
    return `${hatStyle}.${character}`;
  }

  static splitKey(key: string) {
    let [hatStyle, character] = key.split(".");
    if (character.length === 0) {
      // If the character is `.` then it will appear as a zero length string
      // due to the way the split on `.` works
      character = ".";
    }
    return { hatStyle: hatStyle as HatStyleName, character };
  }

  public getEntries() {
    return this.activeMap.getEntries();
  }

  public addToken(hatStyle: HatStyleName, character: string, token: Token) {
    this.activeMap.addToken(hatStyle, character, token);
  }

  public getToken(
    hatStyle: HatStyleName,
    character: string,
    useSnapshot?: boolean
  ) {
    let individualMap: IndividualNavigationMap;

    if (useSnapshot) {
      if (this.mapSnapshot == null) {
        throw new Error(
          "Navigation map snapshot requested, but no snapshot has been taken"
        );
      }

      individualMap = this.mapSnapshot;
    } else {
      individualMap = this.activeMap;
    }

    return individualMap.getToken(hatStyle, character);
  }

  public clear() {
    this.activeMap.clear();
  }

  public dispose() {
    this.activeMap.dispose();

    if (this.mapSnapshot != null) {
      this.mapSnapshot.dispose();
    }
  }

  async maybeTakeSnapshot() {
    if (this.phraseStartSignal != null) {
      const newSignalVersion = await this.phraseStartSignal.getVersion();

      if (newSignalVersion !== this.lastSignalVersion) {
        console.debug("taking snapshot");
        this.takeSnapshot();
        this.lastSignalVersion = newSignalVersion;
      }
    }
  }

  private takeSnapshot() {
    if (this.mapSnapshot != null) {
      this.mapSnapshot.dispose();
    }

    this.mapSnapshot = this.activeMap.clone();
  }
}

class IndividualNavigationMap {
  private documentTokenLists: Map<string, Token[]> = new Map();
  private deregisterFunctions: (() => void)[] = [];

  private map: {
    [decoratedCharacter: string]: Token;
  } = {};

  constructor(private graph: Graph) {}

  private getDocumentTokenList(document: TextDocument) {
    const key = document.uri.toString();
    let currentValue = this.documentTokenLists.get(key);

    if (currentValue == null) {
      currentValue = [];
      this.documentTokenLists.set(key, currentValue);
      this.deregisterFunctions.push(
        this.graph.rangeUpdater.registerRangeInfoList(document, currentValue)
      );
    }

    return currentValue;
  }

  public clone() {
    const ret = new IndividualNavigationMap(this.graph);

    this.getEntries().forEach(([key, token]) => {
      ret.addTokenByKey(key, { ...token });
    });

    return ret;
  }

  public getEntries() {
    return Object.entries(this.map);
  }

  private addTokenByKey(key: string, token: Token) {
    this.map[key] = token;
    this.getDocumentTokenList(token.editor.document).push(token);
  }

  public addToken(hatStyle: HatStyleName, character: string, token: Token) {
    this.addTokenByKey(NavigationMap.getKey(hatStyle, character), token);
  }

  public getToken(hatStyle: HatStyleName, character: string) {
    return this.map[NavigationMap.getKey(hatStyle, character)];
  }

  public clear() {
    this.map = {};
    this.documentTokenLists = new Map();
    this.deregisterFunctions.forEach((func) => func());
  }

  public dispose() {
    this.deregisterFunctions.forEach((func) => func());
  }
}
