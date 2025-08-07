export interface IProvider {
  name: string;
  selector: string;
  maxLength: number;
  createUrl: (text: string, from: string, to: string) => string;
}