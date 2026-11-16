import type { CookieOptions } from 'express';

export class Cookie {
  readonly name: string;
  readonly value: string | number;
  readonly options: CookieOptions;

  constructor(props: { name: string; value: string | number; options?: CookieOptions }) {
    this.name = props.name;
    this.value = props.value;
    this.options = props.options ?? {};
  }
}
