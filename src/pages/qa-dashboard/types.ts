export interface IStore {
  store: string;
  grade: number;
  week: string;
  done_on: string;
  status: "done" | "pending";
}
