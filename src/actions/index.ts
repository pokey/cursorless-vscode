import { Action, ActionRecord, Graph } from "../Types";
import Clear from "./clear";
import Copy from "./copy";
import Cut from "./cut";
import Delete from "./delete";
import ExtractVariable from "./extractVariable";
import { Fold, Unfold } from "./fold";
import { InsertLineBefore, InsertLineAfter } from "./InsertLine";
import {
  SetSelection,
  SetSelectionBefore,
  SetSelectionAfter,
} from "./setSelection";
import Wrap from "./wrap";
import { ScrollToTop, ScrollToCenter, ScrollToBottom } from "./Scroll";
import { Bring, Move, Swap } from "./BringMoveSwap";
import {
  InsertLineAboveAndBelow,
  InsertLineAbove,
  InsertLineBelow,
} from "./InsertEmptyLines";
class Actions implements ActionRecord {
  constructor(private graph: Graph) {}

  // TODO NB Remove when user had time to migrate to new talon code
  use = new Bring(this.graph);

  bring = new Bring(this.graph);
  clear = new Clear(this.graph);
  copy = new Copy(this.graph);
  cut = new Cut(this.graph);
  delete = new Delete(this.graph);
  extractVariable = new ExtractVariable(this.graph);
  fold = new Fold(this.graph);
  insertLineAboveAndBelow = new InsertLineAboveAndBelow(this.graph);
  insertLineAbove = new InsertLineAbove(this.graph);
  insertLineAfter = new InsertLineAfter(this.graph);
  insertLineBelow = new InsertLineBelow(this.graph);
  insertLineBefore = new InsertLineBefore(this.graph);
  move = new Move(this.graph);
  paste: Action = {
    run: async ([targets]) => {
      throw new Error("Not implemented");
    },
    targetPreferences: [{ position: "after", insideOutsideType: "outside" }],
  };
  scrollToBottom = new ScrollToBottom(this.graph);
  scrollToCenter = new ScrollToCenter(this.graph);
  scrollToTop = new ScrollToTop(this.graph);
  setSelection = new SetSelection(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  swap = new Swap(this.graph);
  unfold = new Unfold(this.graph);
  wrap = new Wrap(this.graph);
}

export default Actions;
